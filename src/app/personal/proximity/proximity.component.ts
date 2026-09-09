import {Component} from '@angular/core';
import {UiPageHeaderComponent} from '../../shared/ui/page-header/ui-page-header.component';
import {UiPanelComponent} from '../../shared/ui/panel/ui-panel.component';
import {UiEmptyStateComponent} from '../../shared/ui/empty-state/ui-empty-state.component';

@Component({
    selector: 'app-proximity',
    imports: [UiPageHeaderComponent, UiPanelComponent, UiEmptyStateComponent],
    templateUrl: './proximity.component.html',
    styleUrl: './proximity.component.css'
})
export class ProximityComponent {

}
