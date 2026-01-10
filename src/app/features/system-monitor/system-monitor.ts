import { Component, computed, inject, signal } from '@angular/core';
import { Base } from '../../core/models/base';
import { LanguageService } from '../../core/services/language';
import { ProcessManager } from '../../core/services/process-manager';

@Component({
  selector: 'app-system-monitor',
  imports: [],
  templateUrl: './system-monitor.html',
  styleUrl: './system-monitor.scss',
})
export class SystemMonitor extends Base {
  lang = inject(LanguageService);
  protected readonly processManager = inject(ProcessManager);
  readonly historyLimit = 20;

  readonly cpuHistory = signal<number[]>([]);
  readonly ramHistory = signal<number[]>([]);
  readonly downlink = signal<string>('0');
  readonly rtt = signal<number>(0);
  readonly effectiveType = signal<string>(this.lang.t().systemMonitor.network.unknown);
  readonly downHistory = signal<number[]>(new Array(this.historyLimit).fill(0));

  constructor() {
    super();
    this.startSimulation();
    this.initNetworkMonitoring();
  }

  private startSimulation() {
    setInterval(() => {
      const newStats = {
        cpu: Math.floor(Math.random() * 30) + 10,
        ram: Math.floor(Math.random() * 10) + 30,
        network: Math.floor(Math.random() * 100),
        upTime: Date.now(),
      };

      this.currentMeasurements.set(newStats);
      this.updateHistory(this.cpuHistory, newStats.cpu);
      this.updateHistory(this.ramHistory, newStats.ram);
    }, 1500);
  }

  private updateHistory(historySignal: any, newValue: number) {
    historySignal.update((h: number[]) => {
      const newHistory = [...h, newValue];
      if (newHistory.length > this.historyLimit) newHistory.shift();
      return newHistory;
    });
  }

  currentMeasurements = signal({ cpu: 0, ram: 0, network: 0, upTime: 0 });

  readonly cpuPoints = computed(() => {
    const history = this.cpuHistory();
    const widthStep = 100 / (history.length - 1);
    return history.map((val, i) => `${i * widthStep},${100 - val}`).join(' ');
  });

  readonly ramPoints = computed(() => {
    const history = this.ramHistory();
    const widthStep = 100 / (history.length - 1);
    return history.map((val, i) => `${i * widthStep},${100 - val}`).join(' ');
  });

  readonly downPoints = computed(() => {
    const history = this.downHistory();
    const widthStep = 100 / (history.length - 1);
    return history.map((val, i) => `${i * widthStep},${100 - val}`).join(' ');
  });

  private initNetworkMonitoring() {
    const nav = navigator as any;
    console.log(nav);
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (conn) {
      const updateStats = () => {
        this.downlink.set(conn.downlink.toFixed(2));
        this.rtt.set(conn.rtt);
        this.effectiveType.set(conn.effectiveType);

        this.updateHistory(this.downHistory, conn.downlink.toFixed(2));
      };

      conn.addEventListener('change', updateStats);

      setInterval(updateStats, 1500);
      updateStats();
    } else {
      this.simulateNetworkTraffic();
    }
  }

  private async simulateNetworkTraffic() {
    this.effectiveType.set(this.lang.t().systemMonitor.network.simulated);
    setInterval(async () => {
      if (!navigator.onLine) {
        this.downlink.set('0');
        this.rtt.set(0);
        this.updateHistory(this.downHistory, 0);
        return;
      }

      const start = performance.now();
      try {
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
    }, 1500);
  }
  getProcessStats(processId: string) {
    const seed = processId.length;
    return {
      cpu: ((seed * 1.5) % 4).toFixed(1),
      ram: (seed * 12 + 40).toFixed(0),
    };
  }

  killProcess(id: string) {
    this.processManager.close(id);
  }
}
