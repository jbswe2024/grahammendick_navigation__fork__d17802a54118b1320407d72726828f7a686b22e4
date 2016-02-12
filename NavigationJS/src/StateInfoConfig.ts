﻿import Dialog = require('./config/Dialog');
import IDialog = require('./config/IDialog');
import ConverterFactory = require('./converter/ConverterFactory');
import ReturnDataManager = require('./ReturnDataManager');
import NavigationSettings = require('./NavigationSettings');
import State = require('./config/State');
import IState = require('./config/IState');
import Transition = require('./config/Transition');
import ITransition = require('./config/ITransition');

class StateInfoConfig {
    static build(dialogs: IDialog<string, IState<ITransition<string>[]>[]>[], settings: NavigationSettings, converterFactory: ConverterFactory): { dialogs: { [index: string]: Dialog }, _dialogs: Dialog[] } {
        var _builtDialogs = [];
        var builtDialogs: { [index: string]: Dialog } = {};
        for (var i = 0; i < dialogs.length; i++) {
            var dialogObject = dialogs[i];
            var dialog = new Dialog();
            dialog.index = i;
            for (var key in dialogObject) {
                if (key !== 'states')
                    dialog[key] = dialogObject[key];
            }
            if (!dialog.key)
                throw new Error('key is mandatory for a Dialog');
            if (builtDialogs[dialog.key])
                throw new Error('A Dialog with key ' + dialog.key + ' already exists');
            _builtDialogs.push(dialog);
            builtDialogs[dialog.key] = dialog;
            this.processStates(dialog, dialogObject, settings, converterFactory);
            this.processTransitions(dialog, dialogObject);
            dialog.initial = dialog.states[dialogObject.initial];
            if (!dialogObject.initial)
                throw new Error('initial is mandatory for a Dialog');
            if (!dialog.initial)
                throw new Error(dialog.key + ' Dialog\'s initial key of ' + dialogObject.initial + ' does not match a child State key');
        }
        return {
            dialogs: builtDialogs,
            _dialogs: _builtDialogs   
        };
    }

    private static processStates(dialog: Dialog, dialogObject: IDialog<string, IState<ITransition<string>[]>[]>, settings: NavigationSettings, converterFactory: ConverterFactory) {
        for (var i = 0; i < dialogObject.states.length; i++) {
            var stateObject = dialogObject.states[i];
            var state = new State();
            state.parent = dialog;
            state.index = i;
            state.id = dialog.index + '-' + state.index;
            for (var key in stateObject) {
                if (key !== 'transitions')
                    state[key] = stateObject[key];
            }
            for (var key in state.defaults) {
                if (!state.defaultTypes[key])
                    state.defaultTypes[key] = converterFactory.getConverter(state.defaults[key]).name;
                var formattedData = ReturnDataManager.formatURLObject(settings, converterFactory, key, state.defaults[key], state); 
                state.formattedDefaults[key] = formattedData.val;
                if (formattedData.arrayVal)
                    state.formattedArrayDefaults[key] = formattedData.arrayVal;
            }
            for (var key in state.defaultTypes) {
                converterFactory.getConverterFromName(state.defaultTypes[key]);
            }
            if (!state.key)
                throw new Error('key is mandatory for a State');
            if (dialog.states[state.key])
                throw new Error('A State with key ' + state.key + ' already exists for Dialog ' + dialog.key);
            dialog._states.push(state);
            dialog.states[state.key] = state;
        }
    }

    private static processTransitions(dialog: Dialog, dialogObject: IDialog<string, IState<ITransition<string>[]>[]>) {
        for (var i = 0; i < dialogObject.states.length; i++) {
            if (dialogObject.states[i].transitions) {
                for (var j = 0; j < dialogObject.states[i].transitions.length; j++) {
                    var transitionObject = dialogObject.states[i].transitions[j];
                    var transition = new Transition();
                    transition.index = j;
                    transition.key = transitionObject.key;
                    if (!transition.key)
                        throw new Error('key is mandatory for a Transition');
                    transition.parent = dialog._states[i];
                    transition.to = dialog.states[transitionObject.to];
                    if (!transitionObject.to)
                        throw new Error('to is mandatory for a Transition');
                    if (!transition.to)
                        throw new Error(dialog._states[i].key + ' State\'s Transition to key of ' + transition.key + ' does not match a sibling State key');
                    if (transition.parent.transitions[transition.key])
                        throw new Error('A Transition with key ' + transition.key + ' already exists for State ' + dialog._states[i].key);
                    transition.parent._transitions.push(transition);
                    transition.parent.transitions[transition.key] = transition;
                }
            }
        }
    }
}
export = StateInfoConfig;