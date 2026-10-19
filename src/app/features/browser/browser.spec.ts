import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Browser } from './browser';
import { LanguageService } from '../../core/services/language';

describe('Browser', () => {
  let component: Browser;
  let fixture: ComponentFixture<Browser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Browser],
      providers: [LanguageService],
    }).compileComponents();

    fixture = TestBed.createComponent(Browser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty initial state', () => {
    expect(component.displayUrl()).toBe('');
    expect(component.safeUrl()).toBeNull();
    expect(component.history()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(false);
  });

  it('should navigate to a URL and add it to history', () => {
    component.displayUrl.set('https://example.com');
    component.navigateToUrl();
    expect(component.history()).toContain('https://example.com');
    expect(component.isLoading()).toBe(true);
    expect(component.safeUrl()).not.toBeNull();
  });

  it('should show the external fallback only on the error screen for the failed URL', () => {
    component.displayUrl.set('https://example.com');
    component.navigateToUrl();
    component.displayUrl.set('https://not-submitted.example');
    component.hasError.set(true);
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector('.bg-gnome-header') as HTMLElement;
    const errorLinks = fixture.nativeElement.querySelectorAll(
      'a[rel="noopener noreferrer"]',
    ) as NodeListOf<HTMLAnchorElement>;
    expect(toolbar.querySelector('a')).toBeNull();
    expect(errorLinks.length).toBe(1);
    const link = errorLinks[0];
    expect(link.href).toBe('https://example.com/');
    expect(link.target).toBe('_blank');
    expect(link.textContent).toContain(component.lang.t().browser.externalFallback);
  });

  it('should prepend https when URL does not start with http', () => {
    component.displayUrl.set('example.com');
    component.navigateToUrl();
    expect(component.history()[0]).toBe('https://example.com');
  });

  it('should show a specific error for an invalid URL', () => {
    component.displayUrl.set('https://');
    component.navigateToUrl();
    fixture.detectChanges();

    expect(component.errorType()).toBe('invalidUrl');
    expect(component.safeUrl()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      component.lang.t().browser.invalidUrlTitle,
    );
    expect(fixture.nativeElement.querySelector('a[rel="noopener noreferrer"]')).toBeNull();
  });

  it('should show a generic error message when the iframe reports a load failure', () => {
    component.displayUrl.set('https://example.com');
    component.navigateToUrl();
    component.onError();
    fixture.detectChanges();

    expect(component.errorType()).toBe('loadFailed');
    expect(component.hasError()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain(
      component.lang.t().browser.loadFailedMessage,
    );
  });

  it('should allow showing the standard error screen after an iframe load event', () => {
    component.displayUrl.set('https://www.youtube.com');
    component.navigateToUrl();
    component.onLoad();
    fixture.detectChanges();

    const reportButton = fixture.nativeElement.querySelector(
      `button[title="${component.lang.t().browser.reportLoadFailure}"]`,
    ) as HTMLButtonElement;
    expect(reportButton).toBeTruthy();
    reportButton.click();
    fixture.detectChanges();

    expect(component.errorType()).toBe('loadFailed');
    expect(fixture.nativeElement.textContent).toContain(
      component.lang.t().browser.loadFailedMessage,
    );
    expect(fixture.nativeElement.querySelector('a[rel="noopener noreferrer"]')).toBeTruthy();
  });

  it('should clear state when navigating to empty URL', () => {
    component.displayUrl.set('');
    component.navigateToUrl();
    expect(component.safeUrl()).toBeNull();
    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(false);
  });

  it('should go back to previous URL in history', () => {
    component.displayUrl.set('https://first.com');
    component.navigateToUrl();
    component.displayUrl.set('https://second.com');
    component.navigateToUrl();
    expect(component.history().length).toBe(2);

    component.goBack();
    expect(component.history().length).toBe(1);
    expect(component.displayUrl()).toBe('https://first.com');
  });

  it('should not go back when history has only one entry', () => {
    component.displayUrl.set('https://only.com');
    component.navigateToUrl();
    const historyBefore = component.history().length;
    component.goBack();
    expect(component.history().length).toBe(historyBefore);
  });

  it('should not go back when history is empty', () => {
    expect(() => component.goBack()).not.toThrow();
  });

  it('should set isLoading false and hasError false on onLoad()', () => {
    component.displayUrl.set('https://example.com');
    component.navigateToUrl();
    expect(component.isLoading()).toBe(true);
    component.onLoad();
    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(false);
  });

  it('should initialise from data input when it contains a url', async () => {
    component.data.set({ url: 'https://from-data.com' });
    await fixture.whenStable();
    expect(component.displayUrl()).toBe('https://from-data.com');
  });

  it('should initialise from data input when it is a plain string url', async () => {
    component.data.set('https://plain-string.com' as never);
    await fixture.whenStable();
    expect(component.displayUrl()).toBe('https://plain-string.com');
  });
});
