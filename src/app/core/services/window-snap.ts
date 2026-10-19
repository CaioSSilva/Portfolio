import { Injectable, inject } from '@angular/core';
import {
  Rect,
  WindowSnapEdges,
  WindowSnapLayout,
  WindowSnapShortcut,
  WindowSnapTarget,
  WindowSnapMode,
} from '../models/desktop';
import { Settings } from './settings';
import { TOP_BAR_HEIGHT } from './window-constants';
import { ScreenService } from './screen';

@Injectable({ providedIn: 'root' })
export class WindowSnapService {
  private readonly settings = inject(Settings);
  readonly screen = inject(ScreenService);

  calculateSnap(
    mouseX: number,
    mouseY: number,
    viewportWidth = this.screen.width(),
    viewportHeight = this.screen.height(),
  ): WindowSnapTarget | null {
    const layout = this.getLayout(mouseX, mouseY, viewportWidth, viewportHeight);
    if (!layout) return null;
    return { layout, rect: this.getSnapRect(layout, viewportWidth, viewportHeight) };
  }

  getSnapRect(layout: WindowSnapLayout, viewportWidth: number, viewportHeight: number): Rect {
    const availableHeight = Math.max(1, viewportHeight - TOP_BAR_HEIGHT);
    switch (layout) {
      case 'maximize':
        return { x: 0, y: TOP_BAR_HEIGHT, width: viewportWidth, height: availableHeight };
      case 'left-half':
      case 'right-half':
        return this.getHalfRect(layout, viewportWidth, availableHeight);
      case 'top-left':
      case 'top-right':
      case 'bottom-left':
      case 'bottom-right':
      case 'bottom-half':
        return this.getLowerOrCornerRect(layout, viewportWidth, availableHeight);
      case 'left-third':
      case 'center-third':
      case 'right-third':
        return this.getThirdRect(layout, viewportWidth, availableHeight);
    }
  }

  resolveShortcut(
    event: KeyboardEvent,
    mode: WindowSnapMode,
    isMaximized: boolean,
    isSnapped: boolean,
    currentLayout: WindowSnapLayout | null,
  ): WindowSnapShortcut | null {
    if (this.isClassicBottomCornerShortcut(event, mode)) {
      const layout = event.key === 'ArrowLeft' ? 'bottom-left' : 'bottom-right';
      return { type: 'layout', layout };
    }
    if (!event.altKey || event.ctrlKey || event.metaKey) return null;

    const sideLayout = this.getSideShortcut(event, mode);
    if (sideLayout) return { type: 'layout', layout: sideLayout };
    return this.getVerticalShortcut(event, mode, isMaximized, isSnapped, currentLayout);
  }

  private getLayout(
    mouseX: number,
    mouseY: number,
    viewportWidth: number,
    viewportHeight: number,
  ): WindowSnapLayout | null {
    const edge = this.settings.snapEdgeSize();
    const edges = {
      top: mouseY < TOP_BAR_HEIGHT + edge,
      bottom: mouseY > viewportHeight - edge,
      left: mouseX < edge,
      right: mouseX > viewportWidth - edge,
      center: mouseX >= edge && mouseX <= viewportWidth - edge,
    };
    const mode = this.settings.windowSnapMode();
    if (mode === 'thirds') return this.getThirdLayout(edges);
    if (mode === 'halves') return this.getHalvesLayout(edges);
    return this.getClassicLayout(edges);
  }

  private getThirdLayout(edges: WindowSnapEdges): WindowSnapLayout | null {
    if (edges.top && edges.center) return 'maximize';
    if (edges.bottom && edges.center) return 'center-third';
    if (edges.left) return 'left-third';
    if (edges.right) return 'right-third';
    return null;
  }

  private getHalvesLayout(edges: WindowSnapEdges): WindowSnapLayout | null {
    if (edges.top) return 'maximize';
    if (edges.bottom && edges.center) return 'bottom-half';
    if (edges.left) return 'left-half';
    if (edges.right) return 'right-half';
    return null;
  }

  private getClassicLayout(edges: WindowSnapEdges): WindowSnapLayout | null {
    if (edges.top && edges.center) return 'maximize';
    if (edges.top && edges.left) return 'top-left';
    if (edges.top && edges.right) return 'top-right';
    if (edges.bottom && edges.left) return 'bottom-left';
    if (edges.bottom && edges.right) return 'bottom-right';
    if (edges.bottom && edges.center) return 'bottom-half';
    if (edges.left) return 'left-half';
    if (edges.right) return 'right-half';
    return null;
  }

  private getHalfRect(
    layout: 'left-half' | 'right-half',
    viewportWidth: number,
    height: number,
  ): Rect {
    const width = viewportWidth / 2;
    const x = layout === 'right-half' ? width : 0;
    return { x, y: TOP_BAR_HEIGHT, width, height };
  }

  private getLowerOrCornerRect(
    layout: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-half',
    viewportWidth: number,
    availableHeight: number,
  ): Rect {
    const width = layout === 'bottom-half' ? viewportWidth : viewportWidth / 2;
    const height = availableHeight / 2;
    const isRight = layout === 'top-right' || layout === 'bottom-right';
    const isBottom = layout.startsWith('bottom');
    return {
      x: isRight ? viewportWidth / 2 : 0,
      y: isBottom ? TOP_BAR_HEIGHT + height : TOP_BAR_HEIGHT,
      width,
      height,
    };
  }

  private getThirdRect(
    layout: 'left-third' | 'center-third' | 'right-third',
    viewportWidth: number,
    height: number,
  ): Rect {
    const width = viewportWidth / 3;
    const x = layout === 'right-third' ? width * 2 : layout === 'center-third' ? width : 0;
    return { x, y: TOP_BAR_HEIGHT, width, height };
  }

  private isClassicBottomCornerShortcut(event: KeyboardEvent, mode: WindowSnapMode): boolean {
    return (
      mode === 'classic' &&
      event.altKey &&
      event.ctrlKey &&
      !event.shiftKey &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    );
  }

  private getSideShortcut(
    event: KeyboardEvent,
    mode: WindowSnapMode,
  ): WindowSnapLayout | null {
    if (mode === 'classic' && event.shiftKey) {
      if (event.key === 'ArrowLeft') return 'top-left';
      if (event.key === 'ArrowRight') return 'top-right';
      return null;
    }
    if (event.key === 'ArrowLeft') return mode === 'thirds' ? 'left-third' : 'left-half';
    if (event.key === 'ArrowRight') return mode === 'thirds' ? 'right-third' : 'right-half';
    return null;
  }

  private getVerticalShortcut(
    event: KeyboardEvent,
    mode: WindowSnapMode,
    isMaximized: boolean,
    isSnapped: boolean,
    currentLayout: WindowSnapLayout | null,
  ): WindowSnapShortcut | null {
    if (event.key === 'ArrowUp' && event.shiftKey) return null;
    if (event.key === 'ArrowUp') {
      return isMaximized ? { type: 'restore' } : { type: 'layout', layout: 'maximize' };
    }
    if (event.key !== 'ArrowDown') return null;

    const layout = mode === 'thirds' ? 'center-third' : 'bottom-half';
    if (isSnapped && !isMaximized && currentLayout === layout) return { type: 'restore' };
    return { type: 'layout', layout };
  }
}
