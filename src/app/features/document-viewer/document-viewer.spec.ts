import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentViewer } from './document-viewer';

describe('DocumentViewer', () => {
  let component: DocumentViewer;
  let fixture: ComponentFixture<DocumentViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewer],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
