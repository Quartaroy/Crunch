import { CRUNCH } from "./modules/config.mjs";
import crunchActor from "./modules/objects/CrunchActor.mjs";
import TimeQueue from "./modules/combat/timeQueue.mjs";
// import crunchCharacterSheet from "./modules/sheets/crunchCharacterSheet.mjs";

Hooks.once("init", async () => {
    console.log("CRUNCH | Initializing Crunch Core System");

    CONFIG.CRUNCH = CRUNCH;
    CONFIG.INIT = true;
    CONFIG.Actor.documentClass = crunchActor;

    foundry.applications.apps.DocumentSheetConfig.unregisterSheet(Actor, "core", foundry.appv1.sheets.ActorSheet);
    foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, "crunch", crunchCharacterSheet, { 
    types: ["character"], 
    makeDefault: true,
    });

    preloadHandlebarsTemplates();
    registerHandlebarsHelpers();  

    game.settings.register("crunch", "timeQueue", {
        name: "Time Queue",
        hint: "Internal storage for time queue actors",
        scope: "world",      
        config: false,       
        type: Array,
        default: [],
        onChange: () => {
        const app = game.system.timeQueue;
        if (app && app.rendered) app.render();
}
    })
});

Hooks.once("ready", async () => {
    CONFIG.INIT = false;

    game.system.timeQueue = new TimeQueue();
    game.system.timeQueue.render();

    if(!game.user.isGM) return;
});


Hooks.on("createCombatant", (combatant) => {
    if (game.user.isGM && combatant.actor) TimeQueue.addActor(combatant.actor);
});

Hooks.on("deleteCombatant", async (combatant) => {
    if (!game.user.isGM) return;
    const queue = game.settings.get("crunch", "timeQueue") || [];
    const newQueue = queue.filter(item => item.uuid !== combatant.actor?.uuid);
    await game.settings.set("crunch", "timeQueue", newQueue);
});

function preloadHandlebarsTemplates() {

    const templatePaths = [

        "systems/crunch/templates/sheets/character/character-sheet.hbs",
    ];
    
    return foundry.applications.handlebars.loadTemplates(templatePaths);
};

function registerHandlebarsHelpers() {

    Handlebars.registerHelper("equals", function(v1, v2) { return (v1 === v2)});

    Handlebars.registerHelper("contains", function(element, search) { return (element.includes(search))});

    Handlebars.registerHelper("isGreater", function(p1, p2) { return (p1 > p2)});

    Handlebars.registerHelper("isEqualORGreater", function(p1, p2) { return (p1 >= p2)});

    Handlebars.registerHelper("ifElse", function(condition, val1, val2) { return condition ? val1 : val2; });

    Handlebars.registerHelper("ifOR", function(conditional1, conditional2) { return (conditional1 || conditional2)});

    Handlebars.registerHelper("doLog", function(value) { console.log(value)});

    Handlebars.registerHelper("toBoolean", function(string) { return (string === "true")});

    Handlebars.registerHelper("if", function(condition, val1, val2) {
        return condition ? val1 : (typeof val2 === 'string' ? val2 : "");
    });

    Handlebars.registerHelper('for', function(from, to, incr, content) {

        let result = "";

        for(let i = from; i < to; i += incr)
            result += content.fn(i);

        return result;
    });

    Handlebars.registerHelper("times", function(n, content) {
        
        let result = "";
        
        for(let i = 0; i < n; i++)
            result += content.fn(i);

        return result;
    });

    Handlebars.registerHelper("notEmpty", function(value) {

        if (value == 0 || value == "0") return true;
        if (value == null|| value  == "") return false;
        return true;
    });
}


/* -------------------------------------------- */
/*  General Functions                           */
/* -------------------------------------------- */