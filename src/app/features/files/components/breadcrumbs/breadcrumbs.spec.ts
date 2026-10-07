import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilesBreadcrumbs } from './breadcrumbs';
import { outputToObservable } from '@angular/core/rxjs-interop';

describe('FilesBreadcrumbs', () => {
  let component: FilesBreadcrumbs;
  let fixture: ComponentFixture<FilesBreadcrumbs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesBreadcrumbs],
    }).compileComponents();

    fixture = TestBed.createComponent(FilesBreadcrumbs);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('items input defaults to empty array', () => {
    expect(component.items()).toEqual([]);
  });

  it('items input reflects provided value', () => {
    fixture.componentRef.setInput('items', [{ id: 'root', name: 'Root' }, { id: 'home', name: 'Home' }]);
    fixture.detectChanges();
    expect(component.items().length).toBe(2);
    expect(component.items()[0].id).toBe('root');
  });

  it('onJump output emits when called', () => {
    let emitted: number | undefined;
    outputToObservable(component.onJump).subscribe((v) => (emitted = v));
    component.onJump.emit(1);
    expect(emitted).toBe(1);
  });

  it('onJump emits correct index', () => {
    const emits: number[] = [];
    outputToObservable(component.onJump).subscribe((v) => emits.push(v));
    component.onJump.emit(0);
    component.onJump.emit(2);
    expect(emits).toEqual([0, 2]);
  });
});
