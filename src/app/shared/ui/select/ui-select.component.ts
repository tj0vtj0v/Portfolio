import {CommonModule} from '@angular/common';
import {Component, ElementRef, HostListener, QueryList, ViewChildren, booleanAttribute, forwardRef, inject, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

let nextSelectId = 0;

@Component({
    selector: 'app-ui-select',
    imports: [CommonModule],
    providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelectComponent), multi: true}],
    templateUrl: './ui-select.component.html',
    styleUrl: './ui-select.component.css'
})
export class UiSelectComponent implements ControlValueAccessor {
    @Input() options: readonly unknown[] = [];
    @Input() placeholder = 'Choose an option';
    @Input() id = `ui-select-${++nextSelectId}`;
    @Input() name = '';
    @Input({transform: booleanAttribute}) required = false;
    @Input() disabled = false;

    protected readonly listId = `${this.id}-options`;
    protected value: unknown;
    protected opened = false;
    protected activeIndex = 0;
    private disabledByForm = false;
    private typeaheadBuffer = '';
    private typeaheadReset?: ReturnType<typeof setTimeout>;
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    @ViewChildren('optionButton') private optionButtons?: QueryList<ElementRef<HTMLButtonElement>>;

    private onChange: (value: unknown) => void = () => {};
    private onTouched: () => void = () => {};

    protected get isDisabled(): boolean { return this.disabled || this.disabledByForm; }
    protected get hasValue(): boolean { return this.value !== undefined && this.value !== null; }
    protected get selectedLabel(): string {
        return this.hasValue ? this.labelFor(this.value) : this.placeholder;
    }

    writeValue(value: unknown): void { this.value = value; }
    registerOnChange(fn: (value: unknown) => void): void { this.onChange = fn; }
    registerOnTouched(fn: () => void): void { this.onTouched = fn; }
    setDisabledState(isDisabled: boolean): void { this.disabledByForm = isDisabled; }

    protected labelFor(option: unknown): string {
        if (typeof option === 'object' && option !== null && 'name' in option) {
            return String(option.name);
        }
        return String(option ?? '');
    }

    protected isSelected(option: unknown): boolean { return this.sameValue(option, this.value); }

    protected toggle(event: MouseEvent): void {
        event.stopPropagation();
        if (this.isDisabled) return;
        if (this.opened) this.closeMenu();
        else this.openMenu();
    }

    protected choose(option: unknown): void {
        if (this.isDisabled) return;
        this.value = option;
        this.onChange(option);
        this.onTouched();
        this.closeMenu();
        this.host.nativeElement.querySelector<HTMLButtonElement>('.ui-select__trigger')?.focus();
    }

    protected onTriggerKeydown(event: KeyboardEvent): void {
        if (this.handleTypeahead(event)) return;
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!this.opened) this.openMenu();
            else this.focusActiveOption();
        } else if (event.key === 'Escape' && this.opened) {
            event.preventDefault();
            this.closeMenu();
        }
    }

    protected onOptionKeydown(event: KeyboardEvent): void {
        if (!this.opened || !this.options.length) return;
        if (this.handleTypeahead(event)) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.activeIndex = Math.min(this.activeIndex + 1, this.options.length - 1);
            this.focusActiveOption();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.activeIndex = Math.max(this.activeIndex - 1, 0);
            this.focusActiveOption();
        } else if (event.key === 'Home') {
            event.preventDefault();
            this.activeIndex = 0;
            this.focusActiveOption();
        } else if (event.key === 'End') {
            event.preventDefault();
            this.activeIndex = this.options.length - 1;
            this.focusActiveOption();
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.choose(this.options[this.activeIndex]);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.closeMenu();
            this.host.nativeElement.querySelector<HTMLButtonElement>('.ui-select__trigger')?.focus();
        } else if (event.key === 'Tab') {
            this.closeMenu();
        }
    }

    @HostListener('document:click', ['$event'])
    protected onDocumentClick(event: MouseEvent): void {
        if (this.opened && !this.host.nativeElement.contains(event.target as Node)) this.closeMenu();
    }

    private openMenu(): void {
        if (this.isDisabled || !this.options.length) return;
        this.opened = true;
        const selectedIndex = this.options.findIndex(option => this.sameValue(option, this.value));
        this.activeIndex = selectedIndex >= 0 ? selectedIndex : 0;
        setTimeout(() => this.focusActiveOption());
    }

    private closeMenu(): void {
        if (!this.opened) return;
        this.opened = false;
        this.onTouched();
    }

    private focusActiveOption(): void {
        this.optionButtons?.get(this.activeIndex)?.nativeElement.focus();
    }

    private handleTypeahead(event: KeyboardEvent): boolean {
        if (this.isDisabled || event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return false;

        const key = event.key.toLocaleLowerCase();
        if (!/[\p{L}\p{N}]/u.test(key)) return false;

        const repeatedLetter = this.typeaheadBuffer === key;
        this.typeaheadBuffer = repeatedLetter ? key : `${this.typeaheadBuffer}${key}`;
        let matchIndex = this.findTypeaheadMatch(this.typeaheadBuffer, repeatedLetter);

        // If a quick multi-letter sequence has no match, use the latest letter as a new search.
        if (matchIndex < 0 && this.typeaheadBuffer.length > 1) {
            this.typeaheadBuffer = key;
            matchIndex = this.findTypeaheadMatch(key, false);
        }

        if (matchIndex >= 0) {
            event.preventDefault();
            if (this.opened) {
                this.activeIndex = matchIndex;
                this.focusActiveOption();
            } else {
                this.choose(this.options[matchIndex]);
            }
        }

        this.resetTypeaheadLater();
        return true;
    }

    private findTypeaheadMatch(query: string, cycle: boolean): number {
        if (!this.options.length) return -1;
        const startIndex = cycle ? (this.opened ? this.activeIndex : this.selectedIndex()) + 1 : 0;
        for (let offset = 0; offset < this.options.length; offset++) {
            const index = (startIndex + offset) % this.options.length;
            if (this.labelFor(this.options[index]).toLocaleLowerCase().startsWith(query)) return index;
        }
        return -1;
    }

    private selectedIndex(): number {
        return this.options.findIndex(option => this.sameValue(option, this.value));
    }

    private resetTypeaheadLater(): void {
        if (this.typeaheadReset) clearTimeout(this.typeaheadReset);
        this.typeaheadReset = setTimeout(() => {
            this.typeaheadBuffer = '';
            this.typeaheadReset = undefined;
        }, 700);
    }

    private sameValue(left: unknown, right: unknown): boolean {
        if (left === right) return true;
        if (typeof left !== 'object' || left === null || typeof right !== 'object' || right === null) return false;
        if (!('id' in left) || !('id' in right)) return false;
        const leftId = left.id;
        const rightId = right.id;
        return leftId !== undefined && rightId !== undefined && leftId === rightId;
    }
}
