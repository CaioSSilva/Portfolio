import { TestBed } from '@angular/core/testing';
import { TerminalHistoryService } from './terminal-history';

describe('TerminalHistoryService', () => {
  let service: TerminalHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TerminalHistoryService],
    });
    service = TestBed.inject(TerminalHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('commands is empty initially', () => {
    expect(service.commands()).toEqual([]);
  });

  it('push adds command to the front of the list', () => {
    service.push('ls');
    service.push('cd docs');
    expect(service.commands()[0]).toBe('cd docs');
    expect(service.commands()[1]).toBe('ls');
  });

  it('navigate up returns most recent command', () => {
    service.push('ls');
    service.push('whoami');
    expect(service.navigate(1)).toBe('whoami');
  });

  it('navigate up twice returns second command', () => {
    service.push('ls');
    service.push('whoami');
    service.navigate(1);
    expect(service.navigate(1)).toBe('ls');
  });

  it('navigate down after navigate up returns to empty', () => {
    service.push('ls');
    service.navigate(1);
    expect(service.navigate(-1)).toBe('');
  });

  it('navigate beyond bounds returns null', () => {
    service.push('ls');
    expect(service.navigate(-1)).toBeNull();
  });

  it('navigate up beyond history length returns null', () => {
    service.push('ls');
    service.navigate(1);
    expect(service.navigate(1)).toBeNull();
  });
});
