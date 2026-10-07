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

  it('should prepend https when URL does not start with http', () => {
    component.displayUrl.set('example.com');
    component.navigateToUrl();
    expect(component.history()[0]).toBe('https://example.com');
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
