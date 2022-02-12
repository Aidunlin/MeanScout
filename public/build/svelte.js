
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src\Icon.svelte generated by Svelte v3.46.4 */

    const file$9 = "src\\Icon.svelte";

    function create_fragment$a(ctx) {
    	let svg;
    	let path;
    	let path_d_value;
    	let svg_viewBox_value;
    	let t;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t = text(/*text*/ ctx[1]);
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", path_d_value = /*getIcon*/ ctx[2](/*name*/ ctx[0]).path);
    			add_location(path, file$9, 32, 103, 7070);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*getIcon*/ ctx[2](/*name*/ ctx[0]).width + " 512");
    			toggle_class(svg, "text-icon", /*text*/ ctx[1]);
    			add_location(svg, file$9, 32, 0, 6967);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && path_d_value !== (path_d_value = /*getIcon*/ ctx[2](/*name*/ ctx[0]).path)) {
    				attr_dev(path, "d", path_d_value);
    			}

    			if (dirty & /*name*/ 1 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*getIcon*/ ctx[2](/*name*/ ctx[0]).width + " 512")) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty & /*text*/ 2) {
    				toggle_class(svg, "text-icon", /*text*/ ctx[1]);
    			}

    			if (dirty & /*text*/ 2) set_data_dev(t, /*text*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	let { name = "" } = $$props;
    	let { text = "" } = $$props;

    	let icons = {
    		"bars": {
    			width: 448,
    			path: "M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z"
    		},
    		"copy": {
    			width: 512,
    			path: "M384 96L384 0h-112c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48H464c26.51 0 48-21.49 48-48V128h-95.1C398.4 128 384 113.6 384 96zM416 0v96h96L416 0zM192 352V128h-144c-26.51 0-48 21.49-48 48v288c0 26.51 21.49 48 48 48h192c26.51 0 48-21.49 48-48L288 416h-32C220.7 416 192 387.3 192 352z"
    		},
    		"download": {
    			width: 512,
    			path: "M480 352h-133.5l-45.25 45.25C289.2 409.3 273.1 416 256 416s-33.16-6.656-45.25-18.75L165.5 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h448c17.67 0 32-14.33 32-32v-96C512 366.3 497.7 352 480 352zM432 456c-13.2 0-24-10.8-24-24c0-13.2 10.8-24 24-24s24 10.8 24 24C456 445.2 445.2 456 432 456zM233.4 374.6C239.6 380.9 247.8 384 256 384s16.38-3.125 22.62-9.375l128-128c12.49-12.5 12.49-32.75 0-45.25c-12.5-12.5-32.76-12.5-45.25 0L288 274.8V32c0-17.67-14.33-32-32-32C238.3 0 224 14.33 224 32v242.8L150.6 201.4c-12.49-12.5-32.75-12.5-45.25 0c-12.49 12.5-12.49 32.75 0 45.25L233.4 374.6z"
    		},
    		"erase": {
    			width: 512,
    			path: "M480 416C497.7 416 512 430.3 512 448C512 465.7 497.7 480 480 480H150.6C133.7 480 117.4 473.3 105.4 461.3L25.37 381.3C.3786 356.3 .3786 315.7 25.37 290.7L258.7 57.37C283.7 32.38 324.3 32.38 349.3 57.37L486.6 194.7C511.6 219.7 511.6 260.3 486.6 285.3L355.9 416H480zM265.4 416L332.7 348.7L195.3 211.3L70.63 336L150.6 416L265.4 416z"
    		},
    		"minus": {
    			width: 448,
    			path: "M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"
    		},
    		"pause": {
    			width: 320,
    			path: "M272 63.1l-32 0c-26.51 0-48 21.49-48 47.1v288c0 26.51 21.49 48 48 48L272 448c26.51 0 48-21.49 48-48v-288C320 85.49 298.5 63.1 272 63.1zM80 63.1l-32 0c-26.51 0-48 21.49-48 48v288C0 426.5 21.49 448 48 448l32 0c26.51 0 48-21.49 48-48v-288C128 85.49 106.5 63.1 80 63.1z"
    		},
    		"pen": {
    			width: 512,
    			path: "M362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32zM421.7 220.3L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3z"
    		},
    		"play": {
    			width: 384,
    			path: "M361 215C375.3 223.8 384 239.3 384 256C384 272.7 375.3 288.2 361 296.1L73.03 472.1C58.21 482 39.66 482.4 24.52 473.9C9.377 465.4 0 449.4 0 432V80C0 62.64 9.377 46.63 24.52 38.13C39.66 29.64 58.21 29.99 73.03 39.04L361 215z"
    		},
    		"plus": {
    			width: 448,
    			path: "M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"
    		},
    		"question": {
    			width: 320,
    			path: "M204.3 32.01H96c-52.94 0-96 43.06-96 96c0 17.67 14.31 31.1 32 31.1s32-14.32 32-31.1c0-17.64 14.34-32 32-32h108.3C232.8 96.01 256 119.2 256 147.8c0 19.72-10.97 37.47-30.5 47.33L127.8 252.4C117.1 258.2 112 268.7 112 280v40c0 17.67 14.31 31.99 32 31.99s32-14.32 32-31.99V298.3L256 251.3c39.47-19.75 64-59.42 64-103.5C320 83.95 268.1 32.01 204.3 32.01zM144 400c-22.09 0-40 17.91-40 40s17.91 39.1 40 39.1s40-17.9 40-39.1S166.1 400 144 400z"
    		},
    		"reset": {
    			width: 512,
    			path: "M480 256c0 123.4-100.5 223.9-223.9 223.9c-48.84 0-95.17-15.58-134.2-44.86c-14.12-10.59-16.97-30.66-6.375-44.81c10.59-14.12 30.62-16.94 44.81-6.375c27.84 20.91 61 31.94 95.88 31.94C344.3 415.8 416 344.1 416 256s-71.69-159.8-159.8-159.8c-37.46 0-73.09 13.49-101.3 36.64l45.12 45.14c17.01 17.02 4.955 46.1-19.1 46.1H35.17C24.58 224.1 16 215.5 16 204.9V59.04c0-24.04 29.07-36.08 46.07-19.07l47.6 47.63C149.9 52.71 201.5 32.11 256.1 32.11C379.5 32.11 480 132.6 480 256z"
    		},
    		"save": {
    			width: 448,
    			path: "M433.1 129.1l-83.9-83.9C342.3 38.32 327.1 32 316.1 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h320c35.35 0 64-28.65 64-64V163.9C448 152.9 441.7 137.7 433.1 129.1zM224 416c-35.34 0-64-28.66-64-64s28.66-64 64-64s64 28.66 64 64S259.3 416 224 416zM320 208C320 216.8 312.8 224 304 224h-224C71.16 224 64 216.8 64 208v-96C64 103.2 71.16 96 80 96h224C312.8 96 320 103.2 320 112V208z"
    		},
    		"square-checked": {
    			width: 448,
    			path: "M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM339.8 211.8C350.7 200.9 350.7 183.1 339.8 172.2C328.9 161.3 311.1 161.3 300.2 172.2L192 280.4L147.8 236.2C136.9 225.3 119.1 225.3 108.2 236.2C97.27 247.1 97.27 264.9 108.2 275.8L172.2 339.8C183.1 350.7 200.9 350.7 211.8 339.8L339.8 211.8z"
    		},
    		"square-empty": {
    			width: 448,
    			path: "M384 32C419.3 32 448 60.65 448 96V416C448 451.3 419.3 480 384 480H64C28.65 480 0 451.3 0 416V96C0 60.65 28.65 32 64 32H384zM384 80H64C55.16 80 48 87.16 48 96V416C48 424.8 55.16 432 64 432H384C392.8 432 400 424.8 400 416V96C400 87.16 392.8 80 384 80z"
    		},
    		"star-empty": {
    			width: 576,
    			path: "M287.9 0C297.1 0 305.5 5.25 309.5 13.52L378.1 154.8L531.4 177.5C540.4 178.8 547.8 185.1 550.7 193.7C553.5 202.4 551.2 211.9 544.8 218.2L433.6 328.4L459.9 483.9C461.4 492.9 457.7 502.1 450.2 507.4C442.8 512.7 432.1 513.4 424.9 509.1L287.9 435.9L150.1 509.1C142.9 513.4 133.1 512.7 125.6 507.4C118.2 502.1 114.5 492.9 115.1 483.9L142.2 328.4L31.11 218.2C24.65 211.9 22.36 202.4 25.2 193.7C28.03 185.1 35.5 178.8 44.49 177.5L197.7 154.8L266.3 13.52C270.4 5.249 278.7 0 287.9 0L287.9 0zM287.9 78.95L235.4 187.2C231.9 194.3 225.1 199.3 217.3 200.5L98.98 217.9L184.9 303C190.4 308.5 192.9 316.4 191.6 324.1L171.4 443.7L276.6 387.5C283.7 383.7 292.2 383.7 299.2 387.5L404.4 443.7L384.2 324.1C382.9 316.4 385.5 308.5 391 303L476.9 217.9L358.6 200.5C350.7 199.3 343.9 194.3 340.5 187.2L287.9 78.95z"
    		},
    		"star-filled": {
    			width: 576,
    			path: "M381.2 150.3L524.9 171.5C536.8 173.2 546.8 181.6 550.6 193.1C554.4 204.7 551.3 217.3 542.7 225.9L438.5 328.1L463.1 474.7C465.1 486.7 460.2 498.9 450.2 506C440.3 513.1 427.2 514 416.5 508.3L288.1 439.8L159.8 508.3C149 514 135.9 513.1 126 506C116.1 498.9 111.1 486.7 113.2 474.7L137.8 328.1L33.58 225.9C24.97 217.3 21.91 204.7 25.69 193.1C29.46 181.6 39.43 173.2 51.42 171.5L195 150.3L259.4 17.97C264.7 6.954 275.9-.0391 288.1-.0391C300.4-.0391 311.6 6.954 316.9 17.97L381.2 150.3z"
    		},
    		"stop": {
    			width: 384,
    			path: "M384 128v255.1c0 35.35-28.65 64-64 64H64c-35.35 0-64-28.65-64-64V128c0-35.35 28.65-64 64-64H320C355.3 64 384 92.65 384 128z"
    		}
    	};

    	function getIcon(icon) {
    		if (icons.hasOwnProperty(icon)) {
    			return icons[name];
    		}

    		return icons.question;
    	}

    	const writable_props = ['name', 'text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ name, text, icons, getIcon });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('text' in $$props) $$invalidate(1, text = $$props.text);
    		if ('icons' in $$props) icons = $$props.icons;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, text, getIcon];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { name: 0, text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get name() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\metrics\ToggleMetric.svelte generated by Svelte v3.46.4 */
    const file$8 = "src\\metrics\\ToggleMetric.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let button;
    	let icon;
    	let current;
    	let mounted;
    	let dispose;

    	icon = new Icon({
    			props: {
    				name: "square-" + (/*value*/ ctx[0] ? 'checked' : 'empty'),
    				text: /*name*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			create_component(icon.$$.fragment);
    			add_location(button, file$8, 16, 2, 306);
    			add_location(div, file$8, 15, 0, 297);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			mount_component(icon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggle*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const icon_changes = {};
    			if (dirty & /*value*/ 1) icon_changes.name = "square-" + (/*value*/ ctx[0] ? 'checked' : 'empty');
    			if (dirty & /*name*/ 2) icon_changes.text = /*name*/ ctx[1];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ToggleMetric', slots, []);
    	const dispatch = createEventDispatcher();
    	let { name = "Toggle" } = $$props;
    	let { value = false } = $$props;

    	function toggle() {
    		$$invalidate(0, value = !value);
    		dispatch("update");
    	}

    	const writable_props = ['name', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ToggleMetric> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Icon,
    		dispatch,
    		name,
    		value,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, name, toggle];
    }

    class ToggleMetric extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { name: 1, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToggleMetric",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get name() {
    		throw new Error("<ToggleMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ToggleMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ToggleMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ToggleMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\metrics\NumberMetric.svelte generated by Svelte v3.46.4 */
    const file$7 = "src\\metrics\\NumberMetric.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let button0;
    	let icon0;
    	let t2;
    	let input;
    	let t3;
    	let button1;
    	let icon1;
    	let current;
    	let mounted;
    	let dispose;
    	icon0 = new Icon({ props: { name: "plus" }, $$inline: true });
    	icon1 = new Icon({ props: { name: "minus" }, $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			div0 = element("div");
    			button0 = element("button");
    			create_component(icon0.$$.fragment);
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			button1 = element("button");
    			create_component(icon1.$$.fragment);
    			add_location(button0, file$7, 23, 4, 404);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "class", "number");
    			attr_dev(input, "pattern", "[0-9]*");
    			add_location(input, file$7, 26, 4, 482);
    			add_location(button1, file$7, 27, 4, 554);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$7, 22, 2, 380);
    			add_location(div1, file$7, 20, 0, 361);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			mount_component(icon0, button0, null);
    			append_dev(div0, t2);
    			append_dev(div0, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div0, t3);
    			append_dev(div0, button1);
    			mount_component(icon1, button1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*increment*/ ctx[2], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(button1, "click", /*decrement*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);

    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NumberMetric', slots, []);
    	const dispatch = createEventDispatcher();
    	let { name = "Number" } = $$props;
    	let { value = 0 } = $$props;

    	function increment() {
    		$$invalidate(0, value++, value);
    		dispatch("update");
    	}

    	function decrement() {
    		$$invalidate(0, value--, value);
    		dispatch("update");
    	}

    	const writable_props = ['name', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NumberMetric> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Icon,
    		dispatch,
    		name,
    		value,
    		increment,
    		decrement
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, name, increment, decrement, input_input_handler];
    }

    class NumberMetric extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { name: 1, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NumberMetric",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get name() {
    		throw new Error("<NumberMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<NumberMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<NumberMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<NumberMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\metrics\SelectMetric.svelte generated by Svelte v3.46.4 */
    const file$6 = "src\\metrics\\SelectMetric.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (18:4) {#each values as val}
    function create_each_block$2(ctx) {
    	let option;
    	let t_value = /*val*/ ctx[6] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*val*/ ctx[6];
    			option.value = option.__value;
    			add_location(option, file$6, 18, 6, 377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*values*/ 4 && t_value !== (t_value = /*val*/ ctx[6] + "")) set_data_dev(t, t_value);

    			if (dirty & /*values*/ 4 && option_value_value !== (option_value_value = /*val*/ ctx[6])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(18:4) {#each values as val}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*values*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (/*value*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
    			add_location(select, file$6, 16, 2, 303);
    			add_location(div, file$6, 14, 0, 284);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[4]),
    					listen_dev(select, "change", /*changed*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);

    			if (dirty & /*values*/ 4) {
    				each_value = /*values*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*value, values*/ 5) {
    				select_option(select, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectMetric', slots, []);
    	const dispatch = createEventDispatcher();
    	let { name = "Select" } = $$props;
    	let { values = ["Option"] } = $$props;
    	let { value = values[0] ?? "" } = $$props;

    	function changed() {
    		dispatch("update");
    	}

    	const writable_props = ['name', 'values', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SelectMetric> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		value = select_value(this);
    		$$invalidate(0, value);
    		$$invalidate(2, values);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('values' in $$props) $$invalidate(2, values = $$props.values);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		name,
    		values,
    		value,
    		changed
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('values' in $$props) $$invalidate(2, values = $$props.values);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, name, values, changed, select_change_handler];
    }

    class SelectMetric extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { name: 1, values: 2, value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectMetric",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get name() {
    		throw new Error("<SelectMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SelectMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get values() {
    		throw new Error("<SelectMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set values(value) {
    		throw new Error("<SelectMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SelectMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\metrics\TextMetric.svelte generated by Svelte v3.46.4 */
    const file$5 = "src\\metrics\\TextMetric.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			input = element("input");
    			attr_dev(input, "placeholder", /*tip*/ ctx[2]);
    			add_location(input, file$5, 16, 2, 296);
    			set_style(div, "width", "100%");
    			add_location(div, file$5, 14, 0, 258);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(input, "change", /*changed*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);

    			if (dirty & /*tip*/ 4) {
    				attr_dev(input, "placeholder", /*tip*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextMetric', slots, []);
    	const dispatch = createEventDispatcher();
    	let { name = "Text" } = $$props;
    	let { value = "" } = $$props;
    	let { tip = "" } = $$props;

    	function changed() {
    		dispatch("update");
    	}

    	const writable_props = ['name', 'value', 'tip'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextMetric> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('tip' in $$props) $$invalidate(2, tip = $$props.tip);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		name,
    		value,
    		tip,
    		changed
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('tip' in $$props) $$invalidate(2, tip = $$props.tip);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, name, tip, changed, input_input_handler];
    }

    class TextMetric extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { name: 1, value: 0, tip: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextMetric",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get name() {
    		throw new Error("<TextMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TextMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tip() {
    		throw new Error("<TextMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<TextMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\metrics\RatingMetric.svelte generated by Svelte v3.46.4 */
    const file$4 = "src\\metrics\\RatingMetric.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (20:4) {#each [...Array(count).keys()] as i}
    function create_each_block$1(ctx) {
    	let button;
    	let icon;
    	let t;
    	let current;
    	let mounted;
    	let dispose;

    	icon = new Icon({
    			props: {
    				name: "star-" + (/*value*/ ctx[0] >= /*i*/ ctx[6] ? 'filled' : 'empty')
    			},
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*i*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(icon.$$.fragment);
    			t = space();
    			attr_dev(button, "class", "star");
    			add_location(button, file$4, 20, 6, 416);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(icon, button, null);
    			append_dev(button, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const icon_changes = {};
    			if (dirty & /*value, count*/ 5) icon_changes.name = "star-" + (/*value*/ ctx[0] >= /*i*/ ctx[6] ? 'filled' : 'empty');
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(20:4) {#each [...Array(count).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let current;
    	let each_value = [...Array(/*count*/ ctx[2]).keys()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$4, 18, 2, 347);
    			add_location(div1, file$4, 16, 0, 328);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);

    			if (dirty & /*update, Array, count, value*/ 13) {
    				each_value = [...Array(/*count*/ ctx[2]).keys()];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RatingMetric', slots, []);
    	const dispatch = createEventDispatcher();
    	let { name = "Rating" } = $$props;
    	let { value = 0 } = $$props;
    	let { count = 5 } = $$props;

    	function update(newValue) {
    		$$invalidate(0, value = newValue);
    		dispatch("update");
    	}

    	const writable_props = ['name', 'value', 'count'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RatingMetric> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => update(i);

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('count' in $$props) $$invalidate(2, count = $$props.count);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Icon,
    		dispatch,
    		name,
    		value,
    		count,
    		update
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('count' in $$props) $$invalidate(2, count = $$props.count);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, name, count, update, click_handler];
    }

    class RatingMetric extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { name: 1, value: 0, count: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RatingMetric",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get name() {
    		throw new Error("<RatingMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<RatingMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<RatingMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<RatingMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<RatingMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<RatingMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\metrics\TimerMetric.svelte generated by Svelte v3.46.4 */
    const file$3 = "src\\metrics\\TimerMetric.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let button0;
    	let icon0;
    	let t2;
    	let input;
    	let t3;
    	let button1;
    	let icon1;
    	let current;
    	let mounted;
    	let dispose;

    	icon0 = new Icon({
    			props: {
    				name: /*running*/ ctx[1] ? "pause" : "play"
    			},
    			$$inline: true
    		});

    	icon1 = new Icon({ props: { name: "stop" }, $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			t0 = text(/*name*/ ctx[2]);
    			t1 = space();
    			div0 = element("div");
    			button0 = element("button");
    			create_component(icon0.$$.fragment);
    			t2 = space();
    			input = element("input");
    			t3 = space();
    			button1 = element("button");
    			create_component(icon1.$$.fragment);
    			add_location(button0, file$3, 43, 4, 791);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "class", "number");
    			add_location(input, file$3, 46, 4, 888);
    			add_location(button1, file$3, 47, 4, 963);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$3, 42, 2, 767);
    			add_location(div1, file$3, 40, 0, 748);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			mount_component(icon0, button0, null);
    			append_dev(div0, t2);
    			append_dev(div0, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div0, t3);
    			append_dev(div0, button1);
    			mount_component(icon1, button1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*toggle*/ ctx[4], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(input, "change", /*changed*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*reset*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 4) set_data_dev(t0, /*name*/ ctx[2]);
    			const icon0_changes = {};
    			if (dirty & /*running*/ 2) icon0_changes.name = /*running*/ ctx[1] ? "pause" : "play";
    			icon0.$set(icon0_changes);

    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TimerMetric', slots, []);
    	const dispatch = createEventDispatcher();
    	let { name = "Timer" } = $$props;
    	let { value = 0 } = $$props;
    	let { running = false } = $$props;
    	let interval = null;

    	function changed() {
    		dispatch("update");
    	}

    	function toggle() {
    		if (running) {
    			$$invalidate(1, running = false);
    			clearInterval(interval);
    			changed();
    		} else {
    			$$invalidate(1, running = true);

    			interval = setInterval(
    				() => {
    					if (running) {
    						$$invalidate(0, value = (parseFloat(value) + 0.1).toFixed(1));
    					}
    				},
    				100
    			);
    		}
    	}

    	function reset() {
    		if (running) {
    			toggle();
    		}

    		$$invalidate(0, value = 0);
    		changed();
    	}

    	const writable_props = ['name', 'value', 'running'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TimerMetric> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('running' in $$props) $$invalidate(1, running = $$props.running);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Icon,
    		dispatch,
    		name,
    		value,
    		running,
    		interval,
    		changed,
    		toggle,
    		reset
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('running' in $$props) $$invalidate(1, running = $$props.running);
    		if ('interval' in $$props) interval = $$props.interval;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, running, name, changed, toggle, reset, input_input_handler];
    }

    class TimerMetric extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 2, value: 0, running: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TimerMetric",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get name() {
    		throw new Error("<TimerMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TimerMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TimerMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TimerMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get running() {
    		throw new Error("<TimerMetric>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set running(value) {
    		throw new Error("<TimerMetric>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const exampleTemplate = writable({
      metrics: [
        { name: "Toggle", type: "toggle", group: "Group" },
        { name: "Number", type: "number" },
        { name: "Select", type: "select", values: ["Value 1", "Value 2", "Value 3"] },
        { name: "Text", type: "text", tip: "Tip" },
        { name: "Rating", type: "rating" },
        { name: "Timer", type: "timer" },
      ],
      teams: [1111, 2222, 3333, 4444, 555, 666, 777]
    });

    const metricTypes = writable([
      { name: "toggle", metric: ToggleMetric, default: false },
      { name: "number", metric: NumberMetric, default: 0 },
      { name: "select", metric: SelectMetric, default: 0 },
      { name: "text", metric: TextMetric, default: "" },
      { name: "rating", metric: RatingMetric, default: 0 },
      { name: "timer", metric: TimerMetric, default: 0 },
    ]);

    const msData = writable({
      location: "Red Near",
      team: "",
      match: 1,
      isAbsent: false,
      currentTemplate: {},
      customMetrics: [],
      menuVisible: false,
    });

    /* src\MenuBar.svelte generated by Svelte v3.46.4 */
    const file$2 = "src\\MenuBar.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let button;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1;
    	let span;
    	let t2_value = /*$msData*/ ctx[0].location + "";
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			img = element("img");
    			t0 = text("MeanScout");
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			attr_dev(img, "class", "text-icon");
    			attr_dev(img, "id", "logo");
    			if (!src_url_equal(img.src, img_src_value = "./logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 10, 4, 247);
    			attr_dev(button, "id", "menu-toggle-btn");
    			add_location(button, file$2, 9, 2, 190);
    			attr_dev(span, "id", "location-text");
    			add_location(span, file$2, 12, 2, 329);
    			attr_dev(div, "class", "flex spaced");
    			attr_dev(div, "id", "menu-bar");
    			add_location(div, file$2, 8, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, img);
    			append_dev(button, t0);
    			append_dev(div, t1);
    			append_dev(div, span);
    			append_dev(span, t2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleMenu*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$msData*/ 1 && t2_value !== (t2_value = /*$msData*/ ctx[0].location + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $msData;
    	validate_store(msData, 'msData');
    	component_subscribe($$self, msData, $$value => $$invalidate(0, $msData = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MenuBar', slots, []);

    	function toggleMenu() {
    		set_store_value(msData, $msData.menuVisible = !$msData.menuVisible, $msData);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MenuBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ msData, toggleMenu, $msData });
    	return [$msData, toggleMenu];
    }

    class MenuBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuBar",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Menu.svelte generated by Svelte v3.46.4 */
    const file$1 = "src\\Menu.svelte";

    function create_fragment$2(ctx) {
    	let div5;
    	let span;
    	let t1;
    	let div4;
    	let selectmetric0;
    	let updating_value;
    	let t2;
    	let div1;
    	let t3;
    	let div0;
    	let button0;
    	let icon0;
    	let t4;
    	let button1;
    	let icon1;
    	let t5;
    	let div3;
    	let t6;
    	let div2;
    	let selectmetric1;
    	let updating_value_1;
    	let t7;
    	let button2;
    	let icon2;
    	let t8;
    	let button3;
    	let icon3;
    	let current;
    	let mounted;
    	let dispose;

    	function selectmetric0_value_binding(value) {
    		/*selectmetric0_value_binding*/ ctx[9](value);
    	}

    	let selectmetric0_props = {
    		name: "Location",
    		values: /*locations*/ ctx[2]
    	};

    	if (/*$msData*/ ctx[1].location !== void 0) {
    		selectmetric0_props.value = /*$msData*/ ctx[1].location;
    	}

    	selectmetric0 = new SelectMetric({
    			props: selectmetric0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectmetric0, 'value', selectmetric0_value_binding));
    	selectmetric0.$on("updated", /*locationUpdated*/ ctx[4]);

    	icon0 = new Icon({
    			props: { name: "copy", text: "Copy" },
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: { name: "pen", text: "Edit" },
    			$$inline: true
    		});

    	function selectmetric1_value_binding(value) {
    		/*selectmetric1_value_binding*/ ctx[10](value);
    	}

    	let selectmetric1_props = { name: "", values: /*surveyTypes*/ ctx[3] };

    	if (/*surveyType*/ ctx[0] !== void 0) {
    		selectmetric1_props.value = /*surveyType*/ ctx[0];
    	}

    	selectmetric1 = new SelectMetric({
    			props: selectmetric1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectmetric1, 'value', selectmetric1_value_binding));

    	icon2 = new Icon({
    			props: { name: "download", text: "Download" },
    			$$inline: true
    		});

    	icon3 = new Icon({
    			props: { name: "erase", text: "Erase" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			span = element("span");
    			span.textContent = "Options";
    			t1 = space();
    			div4 = element("div");
    			create_component(selectmetric0.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			t3 = text("Template\r\n      ");
    			div0 = element("div");
    			button0 = element("button");
    			create_component(icon0.$$.fragment);
    			t4 = space();
    			button1 = element("button");
    			create_component(icon1.$$.fragment);
    			t5 = space();
    			div3 = element("div");
    			t6 = text("Surveys\r\n      ");
    			div2 = element("div");
    			create_component(selectmetric1.$$.fragment);
    			t7 = space();
    			button2 = element("button");
    			create_component(icon2.$$.fragment);
    			t8 = space();
    			button3 = element("button");
    			create_component(icon3.$$.fragment);
    			attr_dev(span, "class", "group");
    			add_location(span, file$1, 135, 2, 3987);
    			attr_dev(button0, "id", "template-copy-btn");
    			add_location(button0, file$1, 146, 8, 4262);
    			attr_dev(button1, "id", "template-edit-btn");
    			add_location(button1, file$1, 149, 8, 4390);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$1, 145, 6, 4234);
    			add_location(div1, file$1, 143, 4, 4205);
    			attr_dev(button2, "id", "surveys-download-btn");
    			add_location(button2, file$1, 158, 8, 4674);
    			attr_dev(button3, "id", "surveys-erase-btn");
    			add_location(button3, file$1, 161, 8, 4819);
    			attr_dev(div2, "class", "flex");
    			add_location(div2, file$1, 156, 6, 4567);
    			add_location(div3, file$1, 154, 4, 4539);
    			attr_dev(div4, "class", "flex spaced");
    			add_location(div4, file$1, 136, 2, 4025);
    			attr_dev(div5, "class", "flex");
    			attr_dev(div5, "id", "menu");
    			toggle_class(div5, "hide", !/*$msData*/ ctx[1].menuVisible);
    			add_location(div5, file$1, 134, 0, 3921);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, span);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			mount_component(selectmetric0, div4, null);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			mount_component(icon0, button0, null);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			mount_component(icon1, button1, null);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			mount_component(selectmetric1, div2, null);
    			append_dev(div2, t7);
    			append_dev(div2, button2);
    			mount_component(icon2, button2, null);
    			append_dev(div2, t8);
    			append_dev(div2, button3);
    			mount_component(icon3, button3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "load", /*load*/ ctx[8], false, false, false),
    					listen_dev(button0, "click", /*copyTemplate*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*editTemplate*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*askDownloadSurveys*/ ctx[7], false, false, false),
    					listen_dev(button3, "click", eraseSurveys, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const selectmetric0_changes = {};

    			if (!updating_value && dirty & /*$msData*/ 2) {
    				updating_value = true;
    				selectmetric0_changes.value = /*$msData*/ ctx[1].location;
    				add_flush_callback(() => updating_value = false);
    			}

    			selectmetric0.$set(selectmetric0_changes);
    			const selectmetric1_changes = {};

    			if (!updating_value_1 && dirty & /*surveyType*/ 1) {
    				updating_value_1 = true;
    				selectmetric1_changes.value = /*surveyType*/ ctx[0];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			selectmetric1.$set(selectmetric1_changes);

    			if (dirty & /*$msData*/ 2) {
    				toggle_class(div5, "hide", !/*$msData*/ ctx[1].menuVisible);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectmetric0.$$.fragment, local);
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(selectmetric1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			transition_in(icon3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectmetric0.$$.fragment, local);
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(selectmetric1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			transition_out(icon3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(selectmetric0);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(selectmetric1);
    			destroy_component(icon2);
    			destroy_component(icon3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function eraseSurveys() {
    	if (prompt("Type 'erase' to erase saved surveys") == "erase") {
    		localStorage.surveys = "[]";
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $msData;
    	let $metricTypes;
    	let $exampleTemplate;
    	validate_store(msData, 'msData');
    	component_subscribe($$self, msData, $$value => $$invalidate(1, $msData = $$value));
    	validate_store(metricTypes, 'metricTypes');
    	component_subscribe($$self, metricTypes, $$value => $$invalidate(11, $metricTypes = $$value));
    	validate_store(exampleTemplate, 'exampleTemplate');
    	component_subscribe($$self, exampleTemplate, $$value => $$invalidate(12, $exampleTemplate = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	let locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"];
    	let surveyTypes = ["CSV", "JSON"];
    	let surveyType = surveyTypes[0];

    	function locationUpdated() {
    		let newTheme = "red";
    		if ((/blue/).test($msData.location.toLowerCase())) newTheme = "blue";
    		document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
    		localStorage.location = $msData.location;
    	}

    	function copyTemplate() {
    		if ("clipboard" in navigator) {
    			navigator.clipboard.writeText(JSON.stringify($msData.currentTemplate));
    			alert("Copied template");
    		} else {
    			prompt("Copy the template below", JSON.stringify($msData.currentTemplate));
    		}
    	}

    	function setTemplate(newTemplate = null) {
    		localStorage.backup = "";
    		set_store_value(msData, $msData.currentTemplate = JSON.parse(JSON.stringify(newTemplate ?? $exampleTemplate)), $msData);
    		localStorage.template = JSON.stringify($msData.currentTemplate);

    		set_store_value(
    			msData,
    			$msData.customMetrics = $msData.currentTemplate.metrics.map(metric => {
    				let defaultValue = $metricTypes.find(type => type.name == metric.type).default;

    				if (metric.type == "select") {
    					defaultValue = metric.values[0];
    				}

    				return {
    					...metric,
    					value: defaultValue,
    					default: defaultValue
    				};
    			}),
    			$msData
    		);
    	}

    	function editTemplate() {
    		const newPrompt = prompt("Pase new template (you can also 'reset'):");

    		if (newPrompt) {
    			if (newPrompt == "reset") {
    				setTemplate();
    			} else {
    				const newTemplate = JSON.parse(newPrompt);
    				let error;

    				if (newTemplate.metrics) {
    					newTemplate.metrics.forEach(metric => {
    						if (!metric.name) {
    							error = "Metric has no name";
    						}

    						if (!Array.isArray(metric.values ?? [])) {
    							error = "Metric has invalid values";
    						}

    						if (!metric.type in $metricTypes) {
    							error = "Metric has invalid type";
    						}
    					});
    				} else {
    					error = "Template has no metrics";
    				}

    				if (error) {
    					alert(`Could not set template! ${error}`);
    					return;
    				}

    				setTemplate(newTemplate);
    			}
    		}
    	}

    	function downloadSurveys() {
    		const anchor = document.createElement("a");
    		anchor.href = "data:text/plain;charset=utf-8,";

    		if (surveyType == "CSV") {
    			let surveys = JSON.parse(localStorage.surveys);
    			let csv = "";

    			if (surveys) {
    				surveys.forEach(survey => {
    					let surveyAsCSV = "";

    					survey.forEach(metric => {
    						if (typeof metric.value == "string") {
    							surveyAsCSV += "\"" + metric.value + "\",";
    						} else {
    							surveyAsCSV += metric.value + ",";
    						}
    					});

    					csv += surveyAsCSV + "\n";
    				});
    			}

    			anchor.href += encodeURIComponent(csv);
    			anchor.download = "surveys.csv";
    		} else if (surveyType == "JSON") {
    			anchor.href += encodeURIComponent(localStorage.surveys);
    			anchor.download = "surveys.json";
    		}

    		document.body.append(anchor);
    		anchor.click();
    		anchor.remove();
    	}

    	function askDownloadSurveys() {
    		if (confirm("Confirm download?")) {
    			downloadSurveys();
    		}
    	}

    	function load() {
    		if (localStorage.location) {
    			set_store_value(msData, $msData.location = localStorage.location, $msData);
    			locationUpdated();
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	function selectmetric0_value_binding(value) {
    		if ($$self.$$.not_equal($msData.location, value)) {
    			$msData.location = value;
    			msData.set($msData);
    		}
    	}

    	function selectmetric1_value_binding(value) {
    		surveyType = value;
    		$$invalidate(0, surveyType);
    	}

    	$$self.$capture_state = () => ({
    		msData,
    		metricTypes,
    		exampleTemplate,
    		Icon,
    		SelectMetric,
    		locations,
    		surveyTypes,
    		surveyType,
    		locationUpdated,
    		copyTemplate,
    		setTemplate,
    		editTemplate,
    		downloadSurveys,
    		askDownloadSurveys,
    		eraseSurveys,
    		load,
    		$msData,
    		$metricTypes,
    		$exampleTemplate
    	});

    	$$self.$inject_state = $$props => {
    		if ('locations' in $$props) $$invalidate(2, locations = $$props.locations);
    		if ('surveyTypes' in $$props) $$invalidate(3, surveyTypes = $$props.surveyTypes);
    		if ('surveyType' in $$props) $$invalidate(0, surveyType = $$props.surveyType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		surveyType,
    		$msData,
    		locations,
    		surveyTypes,
    		locationUpdated,
    		copyTemplate,
    		editTemplate,
    		askDownloadSurveys,
    		load,
    		selectmetric0_value_binding,
    		selectmetric1_value_binding
    	];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Main.svelte generated by Svelte v3.46.4 */
    const file = "src\\Main.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[16] = list;
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (99:8) {#each $msData.currentTemplate.teams ?? [] as team}
    function create_each_block_1(ctx) {
    	let option;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			option.__value = option_value_value = /*team*/ ctx[18];
    			option.value = option.__value;
    			add_location(option, file, 99, 10, 3183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$msData*/ 1 && option_value_value !== (option_value_value = /*team*/ ctx[18])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(99:8) {#each $msData.currentTemplate.teams ?? [] as team}",
    		ctx
    	});

    	return block;
    }

    // (121:6) {#if metric.group}
    function create_if_block(ctx) {
    	let span;
    	let t_value = /*metric*/ ctx[15].group + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "group");
    			add_location(span, file, 121, 8, 3767);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$msData*/ 1 && t_value !== (t_value = /*metric*/ ctx[15].group + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(121:6) {#if metric.group}",
    		ctx
    	});

    	return block;
    }

    // (120:4) {#each $msData.currentTemplate.metrics ?? [] as metric, i}
    function create_each_block(ctx) {
    	let t;
    	let switch_instance;
    	let updating_name;
    	let updating_value;
    	let switch_instance_anchor;
    	let current;
    	let if_block = /*metric*/ ctx[15].group && create_if_block(ctx);

    	function switch_instance_name_binding(value) {
    		/*switch_instance_name_binding*/ ctx[9](value, /*i*/ ctx[17]);
    	}

    	function switch_instance_value_binding(value) {
    		/*switch_instance_value_binding*/ ctx[10](value, /*i*/ ctx[17]);
    	}

    	function func(...args) {
    		return /*func*/ ctx[11](/*metric*/ ctx[15], ...args);
    	}

    	var switch_value = /*$metricTypes*/ ctx[1].find(func).metric;

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			values: /*metric*/ ctx[15].values ?? ["Option"],
    			tip: /*metric*/ ctx[15].tip ?? ""
    		};

    		if (/*$msData*/ ctx[0].customMetrics[/*i*/ ctx[17]].name !== void 0) {
    			switch_instance_props.name = /*$msData*/ ctx[0].customMetrics[/*i*/ ctx[17]].name;
    		}

    		if (/*$msData*/ ctx[0].customMetrics[/*i*/ ctx[17]].value !== void 0) {
    			switch_instance_props.value = /*$msData*/ ctx[0].customMetrics[/*i*/ ctx[17]].value;
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, 'name', switch_instance_name_binding));
    		binding_callbacks.push(() => bind(switch_instance, 'value', switch_instance_value_binding));
    		switch_instance.$on("update", /*backupSurvey*/ ctx[2]);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*metric*/ ctx[15].group) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const switch_instance_changes = {};
    			if (dirty & /*$msData*/ 1) switch_instance_changes.values = /*metric*/ ctx[15].values ?? ["Option"];
    			if (dirty & /*$msData*/ 1) switch_instance_changes.tip = /*metric*/ ctx[15].tip ?? "";

    			if (!updating_name && dirty & /*$msData*/ 1) {
    				updating_name = true;
    				switch_instance_changes.name = /*$msData*/ ctx[0].customMetrics[/*i*/ ctx[17]].name;
    				add_flush_callback(() => updating_name = false);
    			}

    			if (!updating_value && dirty & /*$msData*/ 1) {
    				updating_value = true;
    				switch_instance_changes.value = /*$msData*/ ctx[0].customMetrics[/*i*/ ctx[17]].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			if (switch_value !== (switch_value = /*$metricTypes*/ ctx[1].find(func).metric)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, 'name', switch_instance_name_binding));
    					binding_callbacks.push(() => bind(switch_instance, 'value', switch_instance_value_binding));
    					switch_instance.$on("update", /*backupSurvey*/ ctx[2]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(120:4) {#each $msData.currentTemplate.metrics ?? [] as metric, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div6;
    	let div3;
    	let div0;
    	let t0;
    	let input0;
    	let t1;
    	let datalist;
    	let t2;
    	let div1;
    	let t3;
    	let input1;
    	let t4;
    	let div2;
    	let togglemetric;
    	let updating_value;
    	let t5;
    	let div4;
    	let t6;
    	let span;
    	let t8;
    	let div5;
    	let button0;
    	let icon0;
    	let t9;
    	let button1;
    	let icon1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$msData*/ ctx[0].currentTemplate.teams ?? [];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function togglemetric_value_binding(value) {
    		/*togglemetric_value_binding*/ ctx[8](value);
    	}

    	let togglemetric_props = { name: "Absent" };

    	if (/*$msData*/ ctx[0].isAbsent !== void 0) {
    		togglemetric_props.value = /*$msData*/ ctx[0].isAbsent;
    	}

    	togglemetric = new ToggleMetric({
    			props: togglemetric_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(togglemetric, 'value', togglemetric_value_binding));
    	togglemetric.$on("update", /*backupSurvey*/ ctx[2]);
    	let each_value = /*$msData*/ ctx[0].currentTemplate.metrics ?? [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	icon0 = new Icon({
    			props: { name: "save", text: "Save" },
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: { name: "reset", text: "Reset" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text("Team\r\n      ");
    			input0 = element("input");
    			t1 = space();
    			datalist = element("datalist");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			t3 = text("Match\r\n      ");
    			input1 = element("input");
    			t4 = space();
    			div2 = element("div");
    			create_component(togglemetric.$$.fragment);
    			t5 = space();
    			div4 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			span = element("span");
    			span.textContent = "Survey";
    			t8 = space();
    			div5 = element("div");
    			button0 = element("button");
    			create_component(icon0.$$.fragment);
    			t9 = space();
    			button1 = element("button");
    			create_component(icon1.$$.fragment);
    			attr_dev(input0, "id", "metric-team");
    			attr_dev(input0, "list", "teams-list");
    			attr_dev(input0, "maxlength", "5");
    			add_location(input0, file, 90, 6, 2915);
    			attr_dev(datalist, "id", "teams-list");
    			add_location(datalist, file, 97, 6, 3084);
    			add_location(div0, file, 88, 4, 2890);
    			attr_dev(input1, "id", "metric-match");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "pattern", "[0-9]*");
    			add_location(input1, file, 105, 6, 3286);
    			add_location(div1, file, 103, 4, 3260);
    			add_location(div2, file, 113, 4, 3466);
    			attr_dev(div3, "class", "flex spaced");
    			attr_dev(div3, "id", "metrics-default");
    			add_location(div3, file, 87, 2, 2838);
    			attr_dev(div4, "class", "flex spaced");
    			attr_dev(div4, "id", "metrics-custom");
    			toggle_class(div4, "hide", /*$msData*/ ctx[0].isAbsent);
    			add_location(div4, file, 118, 2, 3592);
    			attr_dev(span, "class", "group");
    			add_location(span, file, 134, 2, 4176);
    			add_location(button0, file, 136, 4, 4244);
    			add_location(button1, file, 139, 4, 4335);
    			attr_dev(div5, "class", "flex spaced");
    			add_location(div5, file, 135, 2, 4213);
    			attr_dev(div6, "class", "flex");
    			attr_dev(div6, "id", "main");
    			add_location(div6, file, 86, 0, 2806);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div3);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*$msData*/ ctx[0].team);
    			append_dev(div0, t1);
    			append_dev(div0, datalist);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(datalist, null);
    			}

    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div1, t3);
    			append_dev(div1, input1);
    			set_input_value(input1, /*$msData*/ ctx[0].match);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			mount_component(togglemetric, div2, null);
    			append_dev(div6, t5);
    			append_dev(div6, div4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			append_dev(div6, t6);
    			append_dev(div6, span);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			append_dev(div5, button0);
    			mount_component(icon0, button0, null);
    			append_dev(div5, t9);
    			append_dev(div5, button1);
    			mount_component(icon1, button1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "load", /*load*/ ctx[5], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input0, "change", /*backupSurvey*/ ctx[2], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(input1, "change", /*backupSurvey*/ ctx[2], false, false, false),
    					listen_dev(button0, "click", /*saveSurvey*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*askResetSurvey*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$msData*/ 1 && input0.value !== /*$msData*/ ctx[0].team) {
    				set_input_value(input0, /*$msData*/ ctx[0].team);
    			}

    			if (dirty & /*$msData*/ 1) {
    				each_value_1 = /*$msData*/ ctx[0].currentTemplate.teams ?? [];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(datalist, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$msData*/ 1 && to_number(input1.value) !== /*$msData*/ ctx[0].match) {
    				set_input_value(input1, /*$msData*/ ctx[0].match);
    			}

    			const togglemetric_changes = {};

    			if (!updating_value && dirty & /*$msData*/ 1) {
    				updating_value = true;
    				togglemetric_changes.value = /*$msData*/ ctx[0].isAbsent;
    				add_flush_callback(() => updating_value = false);
    			}

    			togglemetric.$set(togglemetric_changes);

    			if (dirty & /*$metricTypes, $msData, backupSurvey*/ 7) {
    				each_value = /*$msData*/ ctx[0].currentTemplate.metrics ?? [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div4, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*$msData*/ 1) {
    				toggle_class(div4, "hide", /*$msData*/ ctx[0].isAbsent);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(togglemetric.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(togglemetric.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks_1, detaching);
    			destroy_component(togglemetric);
    			destroy_each(each_blocks, detaching);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $msData;
    	let $metricTypes;
    	let $exampleTemplate;
    	validate_store(msData, 'msData');
    	component_subscribe($$self, msData, $$value => $$invalidate(0, $msData = $$value));
    	validate_store(metricTypes, 'metricTypes');
    	component_subscribe($$self, metricTypes, $$value => $$invalidate(1, $metricTypes = $$value));
    	validate_store(exampleTemplate, 'exampleTemplate');
    	component_subscribe($$self, exampleTemplate, $$value => $$invalidate(12, $exampleTemplate = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);

    	function getSurvey() {
    		return [
    			{ name: "Team", value: $msData.team },
    			{ name: "Match", value: $msData.match },
    			{ name: "Absent", value: $msData.isAbsent },
    			...$msData.customMetrics.map(metric => {
    				return { name: metric.name, value: metric.value };
    			})
    		];
    	}

    	function backupSurvey() {
    		localStorage.backup = JSON.stringify(getSurvey());
    	}

    	function saveSurvey() {
    		if (!(/^\d{1,4}[A-Z]?$/).test($msData.team)) {
    			alert("Invalid team value");
    			document.querySelector("#metric-team").focus();
    			return;
    		}

    		if ($msData.currentTemplate.teams) {
    			if (!$msData.currentTemplate.teams.some(team => team == $msData.team)) {
    				alert("Invalid team value");
    				document.querySelector("#metric-team").focus();
    				return;
    			}
    		}

    		if (!(/\d{1,3}/).test($msData.match)) {
    			alert("Invalid match value");
    			document.querySelector("#metric-match").focus();
    			return;
    		}

    		if (confirm("Confirm save?")) {
    			let surveys = JSON.parse(localStorage.surveys ?? "[]");
    			surveys.push(getSurvey());
    			localStorage.surveys = JSON.stringify(surveys);
    			resetSurvey();
    			set_store_value(msData, $msData.match++, $msData);
    		}
    	}

    	function resetSurvey() {
    		set_store_value(msData, $msData.team = "", $msData);
    		set_store_value(msData, $msData.isAbsent = false, $msData);
    		$msData.customMetrics.forEach(metric => metric.value = metric.default);
    		document.querySelector("#metric-team").focus();
    		localStorage.backup = "";
    	}

    	function askResetSurvey() {
    		if (prompt("Type 'reset' to reset the survey") == "reset") {
    			resetSurvey();
    		}
    	}

    	function load() {
    		set_store_value(msData, $msData.currentTemplate = JSON.parse(localStorage.template ?? JSON.stringify($exampleTemplate)), $msData);

    		set_store_value(
    			msData,
    			$msData.customMetrics = $msData.currentTemplate.metrics.map(metric => {
    				let defaultValue = $metricTypes.find(type => type.name == metric.type).default;

    				if (metric.type == "select") {
    					defaultValue = metric.values[0];
    				}

    				return {
    					...metric,
    					value: defaultValue,
    					default: defaultValue
    				};
    			}),
    			$msData
    		);

    		if (localStorage.backup) {
    			const backup = JSON.parse(localStorage.backup);
    			set_store_value(msData, $msData.team = backup.find(metric => metric.name == "Team").value, $msData);
    			set_store_value(msData, $msData.match = backup.find(metric => metric.name == "Match").value, $msData);
    			set_store_value(msData, $msData.isAbsent = backup.find(metric => metric.name == "Absent").value, $msData);

    			$msData.customMetrics.forEach(metric => {
    				metric.value = backup.find(m => m.name == metric.name).value;
    			});
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		$msData.team = this.value;
    		msData.set($msData);
    	}

    	function input1_input_handler() {
    		$msData.match = to_number(this.value);
    		msData.set($msData);
    	}

    	function togglemetric_value_binding(value) {
    		if ($$self.$$.not_equal($msData.isAbsent, value)) {
    			$msData.isAbsent = value;
    			msData.set($msData);
    		}
    	}

    	function switch_instance_name_binding(value, i) {
    		if ($$self.$$.not_equal($msData.customMetrics[i].name, value)) {
    			$msData.customMetrics[i].name = value;
    			msData.set($msData);
    		}
    	}

    	function switch_instance_value_binding(value, i) {
    		if ($$self.$$.not_equal($msData.customMetrics[i].value, value)) {
    			$msData.customMetrics[i].value = value;
    			msData.set($msData);
    		}
    	}

    	const func = (metric, type) => type.name == metric.type;

    	$$self.$capture_state = () => ({
    		msData,
    		metricTypes,
    		exampleTemplate,
    		Icon,
    		ToggleMetric,
    		getSurvey,
    		backupSurvey,
    		saveSurvey,
    		resetSurvey,
    		askResetSurvey,
    		load,
    		$msData,
    		$metricTypes,
    		$exampleTemplate
    	});

    	return [
    		$msData,
    		$metricTypes,
    		backupSurvey,
    		saveSurvey,
    		askResetSurvey,
    		load,
    		input0_input_handler,
    		input1_input_handler,
    		togglemetric_value_binding,
    		switch_instance_name_binding,
    		switch_instance_value_binding,
    		func
    	];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.4 */

    function create_fragment(ctx) {
    	let menubar;
    	let t0;
    	let menu;
    	let t1;
    	let main;
    	let current;
    	let mounted;
    	let dispose;
    	menubar = new MenuBar({ $$inline: true });
    	menu = new Menu({ $$inline: true });
    	main = new Main({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menubar.$$.fragment);
    			t0 = space();
    			create_component(menu.$$.fragment);
    			t1 = space();
    			create_component(main.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(menubar, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(menu, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(main, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "load", load, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menubar.$$.fragment, local);
    			transition_in(menu.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menubar.$$.fragment, local);
    			transition_out(menu.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menubar, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(menu, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(main, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function load() {
    	if ("serviceWorker" in navigator) {
    		navigator.serviceWorker.register("./sw.js");
    	}

    	document.body.classList.remove("hide");
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ MenuBar, Menu, Main, load });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
      target: document.body
    });

    return app;

})();
//# sourceMappingURL=svelte.js.map
