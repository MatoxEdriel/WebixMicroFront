// animation.service.ts
import { Injectable } from '@angular/core';
import { AnimationItem } from 'lottie-web';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private animations = new Map<string, AnimationItem>();

  register(name: string, animation: AnimationItem) {
    this.animations.set(name, animation);
  }

  play(name: string, durationMs: number = 2000) {
    const anim = this.animations.get(name);
    if (anim) {
      anim.stop();
      anim.goToAndPlay(0, true);

      setTimeout(() => {
        anim.stop(); 
      }, durationMs);
    }
  }
}
