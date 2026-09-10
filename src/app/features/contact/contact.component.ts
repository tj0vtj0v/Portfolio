import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {UiPageHeaderComponent} from '../../shared/ui/page-header/ui-page-header.component';

@Component({selector: 'app-contact', imports: [RouterLink, UiPageHeaderComponent], templateUrl: './contact.component.html', styleUrls: ['../portfolio/portfolio.css', './contact.component.css']})
export class ContactComponent {}
