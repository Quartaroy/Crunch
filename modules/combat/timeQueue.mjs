export default class TimeQueue extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
  static DEFAULT_OPTIONS = {
    id: "timeQueue",
    tag: "div",
    window: { frame: false, positioned: true },
    position: { top: 0, left: 0, width: "100%", height: 25 }
  };

  static PARTS = {
    queue: { template: "systems/crunch/templates/time-queue.hbs" }
  };

  async _prepareContext(options) {
    console.log("CRUNCH | Preparing TimeQueue Context");
    const queue = game.settings.get("crunch", "timeQueue") || [];
    
    // Sort by timeSpent so the person at 0 is always first in the list
    const items = queue.map(item => {
      const actor = fromUuidSync(item.uuid);
      // We use a simple 0-100 scale for the CSS left percentage
      const percent = Math.min(100, Math.max(0, item.timeSpent || 0));
      return {
        ...item,
        name: actor ? actor.name : item.name,
        img: actor ? actor.img : item.img,
        cssLeft: `${percent}%`
      };
    });
    return { items };
  }

  /**
   * Adds a new actor to the queue when they enter combat
   */
  static async addActor(actor) {
    const queue = game.settings.get("crunch", "timeQueue") || [];
    if (queue.some(item => item.uuid === actor.uuid)) return;

    // Starting position is based on their Reaction Speed
    const reaction = actor.system.reactionSpeed || 0;
    
    queue.push({
      uuid: actor.uuid,
      name: actor.name,
      img: actor.img,
      timeSpent: reaction 
    });

    return game.settings.set("crunch", "timeQueue", queue);
  }

  /**
 * Moves an actor back and shifts the entire queue forward
 * @param {string} actorUuid - The actor who took an action
 * @param {number} actionCost - The time cost of the action
 */
static async advanceQueue(actorUuid, actionCost) {
    let queue = game.settings.get("crunch", "timeQueue") || [];
    if (queue.length === 0) return;

    // 1. Add cost to the actor who just acted
    queue = queue.map(item => {
        if (item.uuid === actorUuid) {
            return { ...item, timeSpent: (item.timeSpent || 0) + actionCost };
        }
        return item;
    });

    // 2. Find the new lowest value (the next person's position)
    const shiftAmount = Math.min(...queue.map(item => item.timeSpent || 0));

    // 3. Subtract that amount from everyone to shift the whole line left
    const updatedQueue = queue.map(item => ({
        ...item,
        timeSpent: Math.max(0, (item.timeSpent || 0) - shiftAmount)
    }));

    await game.settings.set("crunch", "timeQueue", updatedQueue);
  }

  static async shiftLeft() {
    const queue = game.settings.get("crunch", "timeQueue") || [];
    if (queue.length === 0) return;

    // 1. Find the lowest timeSpent value currently in the queue
    const leadTime = Math.min(...queue.map(item => item.timeSpent || 0));

    // 2. Subtract that leadTime from everyone
    // Using Math.max(0, ...) ensures we never go into negative time
    const updatedQueue = queue.map(item => ({
        ...item,
        timeSpent: Math.max(0, (item.timeSpent || 0) - leadTime)
    }));

    await game.settings.set("crunch", "timeQueue", updatedQueue);
  }
}