import { TestBed } from '@angular/core/testing';
import { Dock } from '../../layout/dock/dock';

describe('Dock', () => {
  let service: Dock;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
