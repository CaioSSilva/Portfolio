import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { SnapPairPicker } from './snap-pair-picker';
import { ProcessManager } from '../../../core/services/process-manager';
import { LanguageService } from '../../../core/services/language';
import { Process } from '../../../core/models/process';
import { Base } from '../../../core/models/base';

const process: Process = {
  id: 'candidate',
  appId: 'files',
  title: 'Files',
  icon: 'fas fa-folder',
  color: '#3584e4',
  component: class MockComponent extends Base {} as never,
  isMinimized: false,
  isMaximized: false,
  zIndex: 2,
  cascadeIndex: 0,
};

describe('SnapPairPicker', () => {
  let fixture: ComponentFixture<SnapPairPicker>;
  const snapPairRequest = signal({
    sourceProcessId: 'source',
    targetLayout: 'right-half' as const,
  });
  const snapPairCandidates = signal([process]);
  const processManagerMock = {
    snapPairRequest,
    snapPairCandidates,
    chooseSnapPairCandidate: vi.fn(),
    dismissSnapPairing: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    snapPairRequest.set({ sourceProcessId: 'source', targetLayout: 'right-half' });
    snapPairCandidates.set([process]);
    await TestBed.configureTestingModule({
      imports: [SnapPairPicker],
      providers: [
        LanguageService,
        { provide: ProcessManager, useValue: processManagerMock },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SnapPairPicker);
    fixture.detectChanges();
  });

  it('shows open windows as choices for the empty side', () => {
    expect(fixture.nativeElement.textContent).toContain(process.title);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
  });

  it('snaps the selected window or dismisses the picker', () => {
    fixture.nativeElement.querySelector('button[type="button"]').click();
    expect(processManagerMock.chooseSnapPairCandidate).toHaveBeenCalledWith(process.id);

    const buttons = fixture.nativeElement.querySelectorAll('button[type="button"]');
    buttons[buttons.length - 1].click();
    expect(processManagerMock.dismissSnapPairing).toHaveBeenCalled();
  });

  it('dismisses when Escape is pressed or the backdrop is clicked', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(processManagerMock.dismissSnapPairing).toHaveBeenCalledTimes(1);

    processManagerMock.dismissSnapPairing.mockClear();
    fixture.nativeElement.querySelector('.fixed.inset-0').click();
    expect(processManagerMock.dismissSnapPairing).toHaveBeenCalledTimes(1);
  });
});
