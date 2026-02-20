import TimeQueue from "../combat/timeQueue.mjs";

export default class crunchCharacterSheet extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.sheets.ActorSheetV2
) {
    panelsCollapsed = false;

    static DEFAULT_OPTIONS = {

        tag: "form",
        classes: ["crunch", "sheet", "characterSheet"],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
            position: {
            width: 1100
        },
        actions: {
            togglePanels: function() {
                this.panelsCollapsed = !this.panelsCollapsed;
                const newWidth = this.panelsCollapsed ? 385 : 1100;
                this.setPosition({ width: newWidth });
                this.render();
            },
            takeAction: async function(event, target) {
                const cost = parseInt(target.dataset.cost);
                const actorUuid = this.actor.uuid;
                
                await TimeQueue.advanceQueue(actorUuid, cost);
            }
        }
    }

    static PARTS = {
        sheetBody: { template: "systems/crunch/templates/sheets/character/character-sheet.hbs" },
    }

    get title() {
        return this.actor.name;
    }
            
    /** @override */
    _configureRenderOptions(options) {

        super._configureRenderOptions(options);

        if (this.document.limited) options.parts = ["sheetBody"]
    }
    
    /** @override */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        
        context.actor = this.actor;
        context.system = this.actor.system;
        context.panelsCollapsed = this.panelsCollapsed;
        
        return context;
    }
    
    // /** @override */
    // _onRender(context, options) {

    //     const tabs = new foundry.applications.ux.Tabs({navSelector: ".tabs", contentSelector: ".content", initial: "tab1"});
    //     tabs.bind(this.element);

    //     const tabs2 = new foundry.applications.ux.Tabs({navSelector: ".tabs2", contentSelector: ".content2", initial: "tab2-1"});
    //     tabs2.bind(this.element);
    // }


    // calculateExperiance(context) {

    //     let earndExp = context.system.experience.earndExp;
    //     let competence = context.system.experience.competence;
    //     let spentExp = 0;
    //     let level = 0;

    //     // Calculate Level

    //     level = ( Math.ceil( (earndExp / 1000) * CONFIG.CRUNCH.compLvlMultiplier[competence]) - 1);


        
        
    //     context.system.experience.spentExp = spentExp;
    //     context.system.experience.level = level;


    //     return context;
    // }
}