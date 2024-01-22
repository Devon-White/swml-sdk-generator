import {SignalWireML} from "./SignalWireML";
import {Section} from "./Section";


const signalWireML = new SignalWireML();

const section = new Section('main');

section.addInstruction({
    cond: {
        else: [
            {
                answer: {}
            }
        ],
        when: "answered",
        then: [
            {
                answer: {}
            }
        ]
    },
    execute: {}
})

signalWireML.toJSON()