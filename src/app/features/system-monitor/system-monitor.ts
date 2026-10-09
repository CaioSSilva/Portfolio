import {
  Component,
  computed,
  inject,
  signal,
  WritableSignal,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { Base } from '../../core/models/base';
import { LanguageService } from '../../core/services/language';
import { ProcessManager } from '../../core/services/process-manager';
import { AppRegistry } from '../../core/services/app-registry';

interface NetworkConnectionInfo {
  downlink: number;
  rtt: number;
  effectiveType: string;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface NavigatorWithNetwork extends Navigator {
  connection?: NetworkConnectionInfo;
  mozConnection?: NetworkConnectionInfo;
  webkitConnection?: NetworkConnectionInfo;
}

@Component({
  selector: 'app-system-monitor',
  standalone: true,
  imports: [],
  templateUrl: './system-monitor.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './system-monitor.scss',
})
export class SystemMonitor extends Base {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appRegistry = inject(AppRegistry);
  readonly lang = inject(LanguageService);
  readonly processManager = inject(ProcessManager);

  readonly downlink = signal<string>('0');
  readonly rtt = signal<number>(0);
  readonly effectiveType = signal<string>(this.lang.t().systemMonitor.network.unknown);
  readonly currentMeasurements = signal({ cpu: 0, ram: 0, network: 0, upTime: 0 });

  private readonly cpuHistory = signal<number[]>([]);
  private readonly ramHistory = signal<number[]>([]);
  private readonly downHistory = signal<number[]>(new Array(20).fill(0));

  readonly cpuPoints = computed(() => this.calculatePoints(this.cpuHistory()));
  readonly ramPoints = computed(() => this.calculatePoints(this.ramHistory()));
  readonly downPoints = computed(() => this.calculatePoints(this.downHistory()));

  private readonly historyLimit = 20;
  private readonly simulation = this.startSimulation();
  private readonly networkMonitoring = this.initNetworkMonitoring();

  constructor() {
    super();
  }

  getProcessTitle(appId: string, fallback: string): string {
    return this.appRegistry.getAppById(appId)?.title ?? fallback;
  }

  getProcessStats(processId: string): { cpu: string; ram: string } {
    const seed = processId.length;
    return {
      cpu: ((seed * 1.5) % 4).toFixed(1),
      ram: (seed + 12).toFixed(0),
    };
  }

  killProcess(id: string): void {
    this.processManager.close(id);
  }

  private calculatePoints(history: number[]): string {
    const widthStep = 100 / (history.length - 1 || 1);
    return history.map((value, index) => `${index * widthStep},${100 - value}`).join(' ');
  }

  private startSimulation(): void {
    interval(1500)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const newStats = {
          cpu: Math.floor(Math.random() * 30) + 10,
          ram: Math.floor(Math.random() * 10) + 30,
          network: Math.floor(Math.random() * 100),
          upTime: Date.now(),
        };

        this.currentMeasurements.set(newStats);
        this.updateHistory(this.cpuHistory, newStats.cpu);
        this.updateHistory(this.ramHistory, newStats.ram);
      });
  }

  private updateHistory(historySignal: WritableSignal<number[]>, newValue: number | string): void {
    historySignal.update((entries: number[]) => {
      const newHistory = [...entries, Number(newValue)];
      if (newHistory.length > this.historyLimit) newHistory.shift();
      return newHistory;
    });
  }

  private initNetworkMonitoring(): void {
    const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithNetwork) : undefined;
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
    if (conn) {
      this.monitorRealConnection(conn);
    } else {
      this.simulateNetworkTraffic();
    }
  }

  private monitorRealConnection(conn: NetworkConnectionInfo): void {
    const updateStats = () => {
      this.downlink.set(conn.downlink.toFixed(2));
      this.rtt.set(conn.rtt);
      this.effectiveType.set(conn.effectiveType);
      this.updateHistory(this.downHistory, conn.downlink);
    };
    conn.addEventListener('change', updateStats);
    interval(1500).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(updateStats);
    updateStats();
    this.destroyRef.onDestroy(() => conn.removeEventListener('change', updateStats));
  }

  private simulateNetworkTraffic(): void {
    this.effectiveType.set(this.lang.t().systemMonitor.network.simulated);
    interval(1500)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.runSimulatedNetworkTick());
  }

  private async runSimulatedNetworkTick(): Promise<void> {
    if (!navigator.onLine) {
      this.downlink.set('0');
      this.rtt.set(0);
      this.updateHistory(this.downHistory, 0);
      return;
    }
    try {
      const start = performance.now();
      await fetch('/favicon.png', { method: 'HEAD', cache: 'no-store' });
      const latency = Math.floor(performance.now() - start);
      const simulatedDownlink = Math.max(1, (1000 / latency) * 10);
      this.rtt.set(latency);
      this.downlink.set(simulatedDownlink.toFixed(2));
      this.updateHistory(this.downHistory, simulatedDownlink);
    } catch {
      this.downlink.set('0');
      this.updateHistory(this.downHistory, 0);
    }
  }
}
