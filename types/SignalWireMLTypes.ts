/**
 * @title Instruction
 * @description This type defines the SignalWireML instructions.
 */
export type Instruction =
    | Cond
    | Execute
    | Request
    | Return
    | Set
    | Switch
    | Transfer
    | Unset
    | AI
    | Answer
    | Connect
    | Denoise
    | Hangup
    | JoinRoom
    | Play
    | Prompt
    | ReceiveFax
    | Record
    | RecordCall
    | SendDigits
    | SendFax
    | SendSMS
    | SIPRefer
    | StopDenoise
    | StopRecordCall
    | StopTap
    | Tap

/**
 * @title RequestMethod
 * @description This type defines the HTTP request method.
 * @enum {string}
 */
export type RequestMethod =
    "GET" |
    "POST" |
    "PUT" |
    "DELETE";

/**
 * @title Cond
 */
export type Cond = {
    /**
     * @property cond  Defines the cond structure
     * @description This type is a SignalWireML instruction that defines a condition.     */
    cond: {
        /**
         * @property  when
         * @description The condition to be evaluated and act on.
         */
        when: string;
        /**
         * @property  then
         * @description The list of SWML instructions to be executed if the condition is true
         */
        then: Instruction[];
        /**
         * @property  else
         * @description The list of SWML instructions to be executed if the condition is false
         */
        else: Instruction[];
    };
};

/**
 * @title Execute
 */
export type Execute = {

    /**
     * @property execute  Defines the execute structure
     * @description This type is a SignalWireML instruction that defines an execute.
     */
    execute: {
        /**
         * @property  dest
         * @description Specifies what to execute. The value can be one of:
         * "<label>" - section in the current document to execute.
         * "https://<URL>" - URL pointing to the document to execute. Sends HTTP POST.
         */
        dest: string;
        /**
         * @property  params
         * @description Named parameters to send to section or URL
         */
        params?: { [key: string]: any };
        /**
         * @property  meta
         * @description User-defined metadata, ignored by SignalWire
         */
        meta?: { [key: string]: any };
        /**
         * @property  on_return
         * @description The list of SWML instructions to be executed when the executed section or URL returns
         */
        on_return?: Instruction[];
    };
};

/**
 * @title Request
 */
export type Request = {
    /**
     * @property request  Defines the request structure
     * @description This type defines a SignalWireML instruction that makes an HTTP request.     */
    request: {
        /**
         * @property url
         * @description The URL to which the request is to be sent.
         */
        url: string;

        /**
         * @property method
         * @description The HTTP method to be used for the request. Can be "GET", "POST", "PUT", or "DELETE".
         */
        method: RequestMethod;

        /**
         * @property headers
         * @description Optional. An object representing the headers to be included in the request.
         */
        headers?: { [key: string]: any };

        /**
         * @property body
         * @description Optional. The body of the request. Can be a string or an object.
         */
        body?: string | { [key: string]: any };

        /**
         * @property timeout
         * @description Optional. Maximum time in seconds to wait for a response. Default is 5.0 seconds.
         */
        timeout?: number;

        /**
         * @property connect_timeout
         * @description Optional. Maximum time in seconds to wait for a connection. Default is 5.0 seconds.
         */
        connect_timeout?: number;

        /**
         * @property save_variables
         * @description Optional. Store parsed JSON response as variables. Default is false.
         */
        save_variables?: boolean;
    };
};

/**
 * @title Return
 */
export type Return = {
    /**
     * @property return  Defines the return structure
     * @description This type defines a SignalWireML instruction that returns a value.
     */
    return: {
        /**
         * @property  key
         * @description The user-defined key to be used to store the value.
         */
        [key: string]: any
    };
};

/**
 * @title Set
 */
export type Set = {
    /**
     * @property set  Defines the set structure
     * @description This type defines a SignalWireML instruction that sets a variable.
     */
    set: {
        /**
         * @property  key
         * @description Accepts an object mapping variable names to values.
         */
        [key: string]: any
    };
};

/**
 * @title Switch
 */
export type Switch = {
    /**
     * @property switch  Defines the switch structure
     * @description This type is a SignalWireML instruction that defines a switch.
     */
    switch: {
        /**
         * @property  variable
         * @description Name of the variable whose value needs to be compared
         */
        variable: string;
        /**
         * @property  case
         * @description Object of values mapped to array of instructions to execute
         */
        case?: { [key: string]: Instruction[]; };
        /**
         * @property  default
         * @description Optional array of instructions to execute if no cases match
         */
        default?: Instruction[];
    };
};

/**
 * @title Transfer
 * @description This type defines a SignalWireML instruction that transfers a call.
 */
export type Transfer = {
    /**
     * @property transfer  Defines the transfer structure
     * @description This type defines a transfer with 'dest', 'params', and 'meta' parts.
     */
    transfer: {
        /**
         * @property  dest
         * @description Specifies where to transfer the call. The value can be one of:
         * "<label>" - section in the current document to transfer to.
         * "https://<URL>" - URL pointing to the document to transfer to. Sends HTTP POST.
         * "relay:<relay application>" - relay application to notify (currently not implemented)
         **/
        dest: string;
        /**
         * @property  params
         * @description Named parameters to send to a section, URL, or application. Optional. Default is not set.
         */
        params?: { [key: string]: any };
        /**
         * @property  meta
         * @description User data, ignored by SignalWire. Optional. Default is not set.
         */
        meta?: { [key: string]: any };
        //result?: Cond | Switch | Array<Cond | Switch>; // TODO: Add ResultElement type once result is implemented
    };
};

/**
 * @title Unset
 * @description This type defines a SignalWireML instruction that unsets a variable.
 */
export type Unset = {
    /**
     * @property unset  Defines the unset structure
     * @description Unset script variables.
     */
    unset: {
        /**
         * @property  vars
         * @description Names of the variables to unset.
         */
        vars: string | string[];
    };
};

/**
 * @title AI
 * @description This type defines the SignalWire AI Gateway (SWAIG) configuration.
 */
export type AI = {
    /**
     * @property ai  Defines the AI structure
     * @description This type defines the AI structure with 'prompt', 'post_prompt', 'post_prompt_url', 'post_prompt_auth_user', 'post_prompt_auth_password', 'params', 'SWAIG', 'hints', 'languages', and 'pronounce' parts.
     */
    ai: {
        /**
         * @property  prompt
         * @description Establishes the initial set of instructions and settings to configure the agent. This is a **required** parameter
         */
        prompt?: AIPrompt;
        post_prompt?: AIPrompt;
        post_prompt_url?: string;
        post_prompt_auth_user?: string;
        post_prompt_auth_password?: string;
        params?: AIParams;
        SWAIG?: SWAIG;
        hints?: string[];
        languages?: AILanguage[];
        pronounce?: AIPronounce[];
    };
};

export type AIPronounce = {
    replace: string;
    with: string;
    ignore_case?: boolean;
};

export type AILanguage = {
    name: string;
    code: string;
    voice?: string;
};

export type AIParams = {
    direction?: AIDirection //"inbound" | "outbound";
    wait_for_user?: boolean;
    end_of_speech_timeout?: number;
    attention_timeout?: number;
    inactivity_timeout?: number;
    background_file?: string;
    background_file_loops?: number;
    background_file_volume?: number;
    ai_volume?: number;
    local_tz?: string;
    conscience?: boolean;
    save_conversation?: boolean;
    conversation_id?: string;
    digit_timeout?: number;
    digit_terminators?: string;
    energy_level?: number;
    swaig_allow_swml?: boolean;
};

export type AIDirection = "inbound" | "outbound";

/**
 * @title AIPrompt
 * @description This type defines the SignalWire AI Prompt settings.
 */
export type AIPrompt = {
    /**
     * @property  text
     * @description The instructions to send to the AI agent.
     */
    text?: string;
    /**
     * @property  temperature
     * @description Randomness setting. Float value between 0.0 and 1.5. Closer to 0 will make the output less random. Default is 1.0.
     */
    temperature?: number;
    /**
     * @property  top_p
     * @description Randomness setting. Alternative to temperature. Float value between 0.0 and 1.0. Closer to 0 will make the output less random. Default is 1.0.
     */
    top_p?: number;
    /**
     * @property  confidence
     * @description Threshold to fire a speech-detect event at the end of the utterance. Float value between 0.0 and 1.0. Decreasing this value will reduce the pause after the user speaks, but may introduce false positives. Default is 0.6.
     */
    confidence?: number;
    /**
     * @property  presence_penalty
     * @description Aversion to staying on topic. Float value between -2.0 and 2.0. Positive values increase the model's likelihood to talk about new topics. Default is 0.0.
     */
    presence_penalty?: number;
    /**
     * @property  frequency_penalty
     * @description Aversion to repeating lines. Float value between -2.0 and 2.0. Positive values decrease the model's likelihood to repeat the same line verbatim. Default is 0.0.
     */
    frequency_penalty?: number;
    //result?: Cond | Switch | Array<Cond | Switch>; // TODO: Add ResultElement type once result is implemented
};

/**
 * @title Answer
 * @description This type defines a SignalWireML instruction that answers a call.
 */
export type Answer =
/**
 * @property answer  Defines the answer structure
 * @description This type defines the answer structure with 'max_duration' part.
 */
    {
        answer: {
            /**
             * @property  max_duration
             * @description Maximum time in seconds to wait for an answer. Can not be less than 7 seconds. Default is 14400 seconds.
             */
        max_duration?: number;
    };
};

/**
 * @title Connect
 * @description This type defines a SignalWireML instruction that connects a call.
 */
export type Connect = {
    connect: {
        from?: string;
        headers?: { [key: string]: any };
        codecs?: string;
        webrtc_media?: boolean;
        session_timeout?: number;
        ringback?: string[];
        timeout?: number;
        max_duration?: number;
        answer_on_bridge?: boolean;
        call_state_url?: string;
        call_state_events?: string[];
        // result?: Cond | Switch | Array<Cond|Switch>; // TODO: Add ResultElement type once result is implemented
    };
};

export type Denoise =
 {
    denoise: {};
};

export type Hangup =
{
    hangup: {
        reason?: HangupReason;
    };
};

export enum HangupReason {
    hangup = "hangup",
    busy = "busy",
    decline = "decline"
}


export type JoinRoom = {
    join_room: {
        name: string;
    };
};

export type Play = {
    play: {
        url?: string;
        urls?: string[];
        volume?: number;
        say_voice?: string;
        say_language?: string;
        say_gender?: string;
    };
};

export type Prompt = {
    prompt: {
        play: string | string[];
        volume?: number;
        say_voice?: string;
        say_language?: string;
        say_gender?: string;
        max_digits?: number;
        terminators?: string;
        digit_timeout?: number;
        initial_timeout?: number;
        speech_timeout?: number;
        speech_end_timeout?: number;
        speech_language?: string;
        speech_hints?: string[];
        //result?: Cond | Switch | Array<Cond|Switch>; // TODO: Add ResultElement type once result is implemented
    };
};

export type ReceiveFax =

    {
        receive_fax: {};
    };

export type Record =
 {
    record: {
        stereo?: boolean;
        format?: RecordFormat //"wav" | "mp3";
        direction?: RecordAudioDirection //"speak" | "listen";
        terminators?: string;
        beep?: boolean;
        input_sensitivity?: number;
        initial_timeout?: number;
        end_silence_timeout?: number;
    };
};

export type RecordAudioDirection = "speak" | "listen";

export type RecordFormat = "wav" | "mp3";


export type RecordCall = {
    record_call: {
        control_id?: string;
        stereo?: boolean;
        format?: RecordFormat //"wav" | "mp3";
        direction?: RecordCallAudioDirection //"speak" | "listen" | "both";
        terminators?: string;
        beep?: boolean;
        input_sensitivity?: number;
        initial_timeout?: number;
        end_silence_timeout?: number;
    };
};

export type RecordCallAudioDirection = "speak" | "listen" | "both";



export type SendDigits = {
    send_digits: {
        digits: string;
    };
};

export type SendFax = {
    send_fax: {
        document: string;
        header_info?: string;
        identity?: string;
    };
};

export type SendSMS = {
    send_sms: {
        to_number: string;
        from_number: string;
        body?: string;
        media?: string[];
        region?: string;
        tags?: string[];
    };
};

export type SIPRefer = {
    sip_refer: {
        to_uri: string;
        // result?: Cond | Switch | Array<Cond|Switch>; // TODO: Add ResultElement type once result is implemented
    };
};

export type StopDenoise = {
    stop_denoise: {};
};

export type StopRecordCall =
 {
    stop_record_call: {
        control_id?: string;
    };
};

export type StopTap =
 {
    stop_tap: {
        control_id?: string;
    };
};

/**
 * @title SWAIG
 * @description This type defines the SignalWire AI Gateway (SWAIG) configuration.
 */
export type SWAIG = {
    defaults?: WebHookDefaults;
    includes?: { [key: string]: any }[];
    functions?: FunctionConfig[];
};

type WebHookDefaults = {
    web_hook_url?: string;
    web_hook_auth_user?: string;
    web_hook_auth_password?: string;
};

/**
 * @title FunctionConfig
 * @description This type defines the configuration for a SignalWire Function.
 */
type FunctionConfig = {
    active?: boolean;
    function: string;
    meta_data?: FunctionMetaData[];
    meta_data_token?: string;
    data_map: DataMap[];
    web_hook_url?: string;
    web_hook_auth_user?: string;
    web_hook_auth_pass?: string;
    purpose: string;
    argument: FunctionArgument;
};
/**
 * @title FunctionMetaData
 * @description This type defines the metadata for a SignalWire Function.
 */
type FunctionMetaData = {
    name: string;
    code: string;
    voice?: string;
};

type DataMap = {
    expressions: Expression[];
    webhooks: WebhookConfig;
};

type Expression = {
    string: string;
    pattern: string;
    output: ExpressionOutput;
};

type ExpressionOutput = {
    response: string;
    action: { [key: string]: any }[];
};

type WebhookConfig = {
    url: string;
    headers: { [key: string]: any };
    method: RequestMethod//"GET" | "POST" | "PUT" | "DELETE"
    output: WebhookOutput;
};

type WebhookOutput = {
    action: Instruction[];
    response: string;
};


type FunctionArgument = {
    type: string | { [key: string]: any };
    properties: { [key: string]: any };
};


export type Tap = {
    tap: {
        uri: string;
        control_id?: string;
        direction?: string;
        codec?: string;
        rtp_ptime?: number;
    };
};