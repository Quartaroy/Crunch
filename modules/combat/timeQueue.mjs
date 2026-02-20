export default class TimeQueue extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
  static DEFAULT_OPTIONS = {
    id: "timeQueue",
    tag: "div",
    window: { frame: false, positioned: true },
    position: { top: 0 }
  };

  static PARTS = {
    queue: { template: "systems/crunch/templates/time-queue.hbs" }
  };

  async _prepareContext(options) {
    const queue = game.settings.get("crunch", "timeQueue") || [];
    const items = queue.map(item => {
      const actor = fromUuidSync(item.uuid);
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

  static async addActor(actor) {
    const queue = game.settings.get("crunch", "timeQueue") || [];
    if (queue.some(item => item.uuid === actor.uuid)) return;
    const reaction = actor.system.reactionSpeed || 0;
    queue.push({
      uuid: actor.uuid,
      name: actor.name,
      img: actor.img,
      timeSpent: Math.min(100, reaction)
    });
    return game.settings.set("crunch", "timeQueue", queue);
  }

  static async tick(delta = 10) {
    const queue = game.settings.get("crunch", "timeQueue") || [];
    const updatedQueue = queue.map(item => ({
      ...item,
      timeSpent: Math.max(0, (item.timeSpent || 0) - delta)
    }));
    await game.settings.set("crunch", "timeQueue", updatedQueue);
  }
}