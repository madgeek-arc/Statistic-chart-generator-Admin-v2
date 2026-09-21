import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [HeaderComponent, RouterOutlet]
})
export class AppComponent {
	title = 'Statistic Chart Generator Admin V2';
}
