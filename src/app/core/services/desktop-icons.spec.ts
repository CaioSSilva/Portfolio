import { TestBed } from '@angular/core/testing';

import { DesktopIcons } from './desktop-icons';

describe('DesktopIcons', () => {
  let service: DesktopIcons;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DesktopIcons);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
