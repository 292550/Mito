import { Vector2 } from "three";
import { World } from "../world";
import { Silt } from "./soil";
export class Fountain extends Silt {
  displayName = "Fountain";

  isObstacle = true;

  public cooldown = 0;

  constructor(pos: Vector2, world: World, public secondsPerWater: number, public waterRemaining: number) {
    super(pos, world);
  }

  shouldStep(dt: number) {
    return dt > 0.1;
  }

  step(dt: number) {
    super.step(dt);
    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }
    if (this.inventory.space() > 1 && this.cooldown <= 0 && this.waterRemaining > 0) {
      // just constantly give yourself water
      this.inventory.add(1, 0);
      this.waterRemaining -= 1;
      if (this.waterRemaining > 0) {
        this.cooldown = this.secondsPerWater;
      }
    }
  }
}
