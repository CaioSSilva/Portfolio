import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { ScrollupComponent } from './components/scrollup/scrollup.component';
import { AboutComponent } from './components/about/about.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SkillsComponent } from './components/skills/skills.component';
import { QualificationsComponent } from './components/qualifications/qualifications.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import { LanguageComponent } from './components/language/language.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { CursorComponent } from './components/cursor/cursor.component';

@NgModule({ declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserModule,
        HeaderComponent,
        FontAwesomeModule,
        HomeComponent,
        ScrollupComponent,
        AboutComponent,
        SkillsComponent,
        QualificationsComponent,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),
        PortfolioComponent,
        ContactComponent,
        FooterComponent,
        LanguageComponent,
        CursorComponent], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {}

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
