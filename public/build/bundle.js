
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    function hostMatches(anchor) {
      const host = location.host;
      return (
        anchor.host == host ||
        // svelte seems to kill anchor.host value in ie11, so fall back to checking href
        anchor.href.indexOf(`https://${host}`) === 0 ||
        anchor.href.indexOf(`http://${host}`) === 0
      )
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.23.2 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(10, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(9, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(8, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 256) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 1536) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [routes, location, base, basepath, url, $$scope, $$slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.23.2 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 530) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let $activeRoute;
    	let $location;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.23.2 */
    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			a = claim_element(nodes, "A", { href: true, "aria-current": true });
    			var a_nodes = children(a);
    			if (default_slot) default_slot.l(a_nodes);
    			a_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty & /*href*/ 1 && { href: /*href*/ ctx[0] },
    				dirty & /*ariaCurrent*/ 4 && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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

    function instance$2($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Link", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(12, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(13, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16448) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 32769) {
    			 $$invalidate(12, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 32769) {
    			 $$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 45569) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		$$scope,
    		$$slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A link action that can be added to <a href=""> tags rather
     * than using the <Link> component.
     *
     * Example:
     * ```html
     * <a href="/post/{postId}" use:link>{post.title}</a>
     * ```
     */
    function link(node) {
      function onClick(event) {
        const anchor = event.currentTarget;

        if (
          anchor.target === "" &&
          hostMatches(anchor) &&
          shouldNavigate(event)
        ) {
          event.preventDefault();
          navigate(anchor.pathname + anchor.search, { replace: anchor.hasAttribute("replace") });
        }
      }

      node.addEventListener("click", onClick);

      return {
        destroy() {
          node.removeEventListener("click", onClick);
        }
      };
    }

    /* src/components/Testing.svelte generated by Svelte v3.23.2 */

    const file$1 = "src/components/Testing.svelte";

    function create_fragment$3(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let form;
    	let input0;
    	let t2;
    	let input1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Testing Component");
    			t1 = space();
    			form = element("form");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", {});
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Testing Component");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			form = claim_element(nodes, "FORM", { action: true });
    			var form_nodes = children(form);
    			input0 = claim_element(form_nodes, "INPUT", { type: true, value: true });
    			t2 = claim_space(form_nodes);
    			input1 = claim_element(form_nodes, "INPUT", { type: true, value: true });
    			form_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h1, file$1, 5, 0, 67);
    			attr_dev(input0, "type", "text");
    			input0.value = /*firstName*/ ctx[0];
    			add_location(input0, file$1, 8, 2, 114);
    			attr_dev(input1, "type", "text");
    			input1.value = /*lastName*/ ctx[1];
    			add_location(input1, file$1, 9, 2, 156);
    			attr_dev(form, "action", "");
    			add_location(form, file$1, 7, 0, 95);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, input0);
    			append_dev(form, t2);
    			append_dev(form, input1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*firstName*/ 1 && input0.value !== /*firstName*/ ctx[0]) {
    				prop_dev(input0, "value", /*firstName*/ ctx[0]);
    			}

    			if (dirty & /*lastName*/ 2 && input1.value !== /*lastName*/ ctx[1]) {
    				prop_dev(input1, "value", /*lastName*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
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
    	let { firstName } = $$props;
    	let { lastName } = $$props;
    	const writable_props = ["firstName", "lastName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Testing> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Testing", $$slots, []);

    	$$self.$set = $$props => {
    		if ("firstName" in $$props) $$invalidate(0, firstName = $$props.firstName);
    		if ("lastName" in $$props) $$invalidate(1, lastName = $$props.lastName);
    	};

    	$$self.$capture_state = () => ({ firstName, lastName });

    	$$self.$inject_state = $$props => {
    		if ("firstName" in $$props) $$invalidate(0, firstName = $$props.firstName);
    		if ("lastName" in $$props) $$invalidate(1, lastName = $$props.lastName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [firstName, lastName];
    }

    class Testing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { firstName: 0, lastName: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Testing",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*firstName*/ ctx[0] === undefined && !("firstName" in props)) {
    			console.warn("<Testing> was created without expected prop 'firstName'");
    		}

    		if (/*lastName*/ ctx[1] === undefined && !("lastName" in props)) {
    			console.warn("<Testing> was created without expected prop 'lastName'");
    		}
    	}

    	get firstName() {
    		throw new Error("<Testing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstName(value) {
    		throw new Error("<Testing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lastName() {
    		throw new Error("<Testing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lastName(value) {
    		throw new Error("<Testing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navigation.svelte generated by Svelte v3.23.2 */
    const file$2 = "src/components/Navigation.svelte";

    function create_fragment$4(ctx) {
    	let nav;
    	let ul;
    	let li0;
    	let a0;
    	let t0;
    	let link_action;
    	let t1;
    	let li1;
    	let a1;
    	let t2;
    	let link_action_1;
    	let t3;
    	let li2;
    	let a2;
    	let t4;
    	let link_action_2;
    	let t5;
    	let li3;
    	let a3;
    	let t6;
    	let link_action_3;
    	let t7;
    	let li4;
    	let a4;
    	let t8;
    	let link_action_4;
    	let t9;
    	let li5;
    	let a5;
    	let t10;
    	let link_action_5;
    	let t11;
    	let li6;
    	let a6;
    	let t12;
    	let link_action_6;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t0 = text("Home");
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t2 = text("About");
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			t4 = text("Animations");
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			t6 = text("Image Effects");
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			t8 = text("Image Cutting");
    			t9 = space();
    			li5 = element("li");
    			a5 = element("a");
    			t10 = text("Parallax");
    			t11 = space();
    			li6 = element("li");
    			a6 = element("a");
    			t12 = text("Testing");
    			this.h();
    		},
    		l: function claim(nodes) {
    			nav = claim_element(nodes, "NAV", {});
    			var nav_nodes = children(nav);
    			ul = claim_element(nav_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", { class: true });
    			var li0_nodes = children(li0);
    			a0 = claim_element(li0_nodes, "A", { href: true, class: true });
    			var a0_nodes = children(a0);
    			t0 = claim_text(a0_nodes, "Home");
    			a0_nodes.forEach(detach_dev);
    			li0_nodes.forEach(detach_dev);
    			t1 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", { class: true });
    			var li1_nodes = children(li1);
    			a1 = claim_element(li1_nodes, "A", { href: true, class: true });
    			var a1_nodes = children(a1);
    			t2 = claim_text(a1_nodes, "About");
    			a1_nodes.forEach(detach_dev);
    			li1_nodes.forEach(detach_dev);
    			t3 = claim_space(ul_nodes);
    			li2 = claim_element(ul_nodes, "LI", { class: true });
    			var li2_nodes = children(li2);
    			a2 = claim_element(li2_nodes, "A", { href: true, class: true });
    			var a2_nodes = children(a2);
    			t4 = claim_text(a2_nodes, "Animations");
    			a2_nodes.forEach(detach_dev);
    			li2_nodes.forEach(detach_dev);
    			t5 = claim_space(ul_nodes);
    			li3 = claim_element(ul_nodes, "LI", { class: true });
    			var li3_nodes = children(li3);
    			a3 = claim_element(li3_nodes, "A", { href: true, class: true });
    			var a3_nodes = children(a3);
    			t6 = claim_text(a3_nodes, "Image Effects");
    			a3_nodes.forEach(detach_dev);
    			li3_nodes.forEach(detach_dev);
    			t7 = claim_space(ul_nodes);
    			li4 = claim_element(ul_nodes, "LI", { class: true });
    			var li4_nodes = children(li4);
    			a4 = claim_element(li4_nodes, "A", { href: true, class: true });
    			var a4_nodes = children(a4);
    			t8 = claim_text(a4_nodes, "Image Cutting");
    			a4_nodes.forEach(detach_dev);
    			li4_nodes.forEach(detach_dev);
    			t9 = claim_space(ul_nodes);
    			li5 = claim_element(ul_nodes, "LI", { class: true });
    			var li5_nodes = children(li5);
    			a5 = claim_element(li5_nodes, "A", { href: true, class: true });
    			var a5_nodes = children(a5);
    			t10 = claim_text(a5_nodes, "Parallax");
    			a5_nodes.forEach(detach_dev);
    			li5_nodes.forEach(detach_dev);
    			t11 = claim_space(ul_nodes);
    			li6 = claim_element(ul_nodes, "LI", { class: true });
    			var li6_nodes = children(li6);
    			a6 = claim_element(li6_nodes, "A", { href: true, class: true });
    			var a6_nodes = children(a6);
    			t12 = claim_text(a6_nodes, "Testing");
    			a6_nodes.forEach(detach_dev);
    			li6_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			nav_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-h4pkyn");
    			add_location(a0, file$2, 42, 6, 556);
    			attr_dev(li0, "class", "svelte-h4pkyn");
    			add_location(li0, file$2, 41, 4, 545);
    			attr_dev(a1, "href", "about");
    			attr_dev(a1, "class", "svelte-h4pkyn");
    			add_location(a1, file$2, 45, 6, 611);
    			attr_dev(li1, "class", "svelte-h4pkyn");
    			add_location(li1, file$2, 44, 4, 600);
    			attr_dev(a2, "href", "animation");
    			attr_dev(a2, "class", "svelte-h4pkyn");
    			add_location(a2, file$2, 48, 6, 671);
    			attr_dev(li2, "class", "svelte-h4pkyn");
    			add_location(li2, file$2, 47, 4, 660);
    			attr_dev(a3, "href", "image-effects");
    			attr_dev(a3, "class", "svelte-h4pkyn");
    			add_location(a3, file$2, 51, 6, 740);
    			attr_dev(li3, "class", "svelte-h4pkyn");
    			add_location(li3, file$2, 50, 4, 729);
    			attr_dev(a4, "href", "image-cutting");
    			attr_dev(a4, "class", "svelte-h4pkyn");
    			add_location(a4, file$2, 54, 6, 816);
    			attr_dev(li4, "class", "svelte-h4pkyn");
    			add_location(li4, file$2, 53, 4, 805);
    			attr_dev(a5, "href", "parallax");
    			attr_dev(a5, "class", "svelte-h4pkyn");
    			add_location(a5, file$2, 57, 6, 892);
    			attr_dev(li5, "class", "svelte-h4pkyn");
    			add_location(li5, file$2, 56, 4, 881);
    			attr_dev(a6, "href", "testing");
    			attr_dev(a6, "class", "svelte-h4pkyn");
    			add_location(a6, file$2, 60, 6, 958);
    			attr_dev(li6, "class", "svelte-h4pkyn");
    			add_location(li6, file$2, 59, 4, 947);
    			attr_dev(ul, "class", "svelte-h4pkyn");
    			add_location(ul, file$2, 40, 2, 536);
    			add_location(nav, file$2, 39, 0, 528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t2);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(a3, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, t8);
    			append_dev(ul, t9);
    			append_dev(ul, li5);
    			append_dev(li5, a5);
    			append_dev(a5, t10);
    			append_dev(ul, t11);
    			append_dev(ul, li6);
    			append_dev(li6, a6);
    			append_dev(a6, t12);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(link_action = link.call(null, a0)),
    					action_destroyer(link_action_1 = link.call(null, a1)),
    					action_destroyer(link_action_2 = link.call(null, a2)),
    					action_destroyer(link_action_3 = link.call(null, a3)),
    					action_destroyer(link_action_4 = link.call(null, a4)),
    					action_destroyer(link_action_5 = link.call(null, a5)),
    					action_destroyer(link_action_6 = link.call(null, a6))
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
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
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navigation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navigation", $$slots, []);
    	$$self.$capture_state = () => ({ link });
    	return [];
    }

    class Navigation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navigation",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/About.svelte generated by Svelte v3.23.2 */

    const file$3 = "src/components/About.svelte";

    function create_fragment$5(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let h3;
    	let t2;
    	let t3;
    	let ul;
    	let li0;
    	let t4;
    	let t5;
    	let li1;
    	let t6;
    	let t7;
    	let li2;
    	let t8;
    	let t9;
    	let li3;
    	let t10;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Summit days 07.2020");
    			t1 = space();
    			h3 = element("h3");
    			t2 = text("Topics to cover:");
    			t3 = space();
    			ul = element("ul");
    			li0 = element("li");
    			t4 = text("Parallax scrolling");
    			t5 = space();
    			li1 = element("li");
    			t6 = text("Animation triggering");
    			t7 = space();
    			li2 = element("li");
    			t8 = text("Image cutting");
    			t9 = space();
    			li3 = element("li");
    			t10 = text("Image effects");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", {});
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Summit days 07.2020");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			h3 = claim_element(nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t2 = claim_text(h3_nodes, "Topics to cover:");
    			h3_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			ul = claim_element(nodes, "UL", {});
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", {});
    			var li0_nodes = children(li0);
    			t4 = claim_text(li0_nodes, "Parallax scrolling");
    			li0_nodes.forEach(detach_dev);
    			t5 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", {});
    			var li1_nodes = children(li1);
    			t6 = claim_text(li1_nodes, "Animation triggering");
    			li1_nodes.forEach(detach_dev);
    			t7 = claim_space(ul_nodes);
    			li2 = claim_element(ul_nodes, "LI", {});
    			var li2_nodes = children(li2);
    			t8 = claim_text(li2_nodes, "Image cutting");
    			li2_nodes.forEach(detach_dev);
    			t9 = claim_space(ul_nodes);
    			li3 = claim_element(ul_nodes, "LI", {});
    			var li3_nodes = children(li3);
    			t10 = claim_text(li3_nodes, "Image effects");
    			li3_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h1, file$3, 3, 0, 20);
    			add_location(h3, file$3, 5, 0, 50);
    			add_location(li0, file$3, 8, 2, 84);
    			add_location(li1, file$3, 9, 2, 114);
    			add_location(li2, file$3, 10, 2, 146);
    			add_location(li3, file$3, 11, 2, 171);
    			add_location(ul, file$3, 7, 0, 77);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, t6);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(li2, t8);
    			append_dev(ul, t9);
    			append_dev(ul, li3);
    			append_dev(li3, t10);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ul);
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

    function instance$5($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("About", $$slots, []);
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Animation.svelte generated by Svelte v3.23.2 */

    const file$4 = "src/components/Animation.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (274:6) {#each mountains as mtX}
    function create_each_block_3(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			children(div).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "img " + /*mtX*/ ctx[11] + " animation " + /*animationName*/ ctx[16] + " svelte-13ni0ri");
    			add_location(div, file$4, 274, 8, 5199);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(274:6) {#each mountains as mtX}",
    		ctx
    	});

    	return block;
    }

    // (269:0) {#each animations as animationName}
    function create_each_block_2(ctx) {
    	let div1;
    	let h3;
    	let t0_value = /*animationName*/ ctx[16] + "";
    	let t0;
    	let t1;
    	let div0;
    	let each_value_3 = /*mountains*/ ctx[0];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", {});
    			var div1_nodes = children(div1);
    			h3 = claim_element(div1_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, t0_value);
    			h3_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h3, file$4, 270, 4, 5096);
    			attr_dev(div0, "class", "animation-container svelte-13ni0ri");
    			add_location(div0, file$4, 272, 4, 5126);
    			add_location(div1, file$4, 269, 2, 5086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mountains, animations*/ 3) {
    				each_value_3 = /*mountains*/ ctx[0];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(269:0) {#each animations as animationName}",
    		ctx
    	});

    	return block;
    }

    // (285:4) {#each mountains as mtX}
    function create_each_block_1(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t = claim_space(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", div0_class_value = "img " + /*mtX*/ ctx[11] + " animation grow" + " svelte-13ni0ri");
    			add_location(div0, file$4, 286, 8, 5429);
    			attr_dev(div1, "class", "position-relative svelte-13ni0ri");
    			add_location(div1, file$4, 285, 6, 5389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(285:4) {#each mountains as mtX}",
    		ctx
    	});

    	return block;
    }

    // (296:2) {#each mountains as mtX}
    function create_each_block(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let button0;
    	let t1;
    	let t2;
    	let button1;
    	let t3;
    	let t4;
    	let button2;
    	let t5;
    	let button3;
    	let t6;
    	let button4;
    	let t7;
    	let button5;
    	let t8;
    	let mounted;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[2](/*mtX*/ ctx[11], ...args);
    	}

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[3](/*mtX*/ ctx[11], ...args);
    	}

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[4](/*mtX*/ ctx[11], ...args);
    	}

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[5](/*mtX*/ ctx[11], ...args);
    	}

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[6](/*mtX*/ ctx[11], ...args);
    	}

    	function click_handler_5(...args) {
    		return /*click_handler_5*/ ctx[7](/*mtX*/ ctx[11], ...args);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			button0 = element("button");
    			t1 = text("+");
    			t2 = space();
    			button1 = element("button");
    			t3 = text("-");
    			t4 = space();
    			button2 = element("button");
    			t5 = space();
    			button3 = element("button");
    			t6 = space();
    			button4 = element("button");
    			t7 = space();
    			button5 = element("button");
    			t8 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t0 = claim_space(div1_nodes);
    			button0 = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			t1 = claim_text(button0_nodes, "+");
    			button0_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			button1 = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);
    			t3 = claim_text(button1_nodes, "-");
    			button1_nodes.forEach(detach_dev);
    			t4 = claim_space(div1_nodes);
    			button2 = claim_element(div1_nodes, "BUTTON", { class: true });
    			children(button2).forEach(detach_dev);
    			t5 = claim_space(div1_nodes);
    			button3 = claim_element(div1_nodes, "BUTTON", { class: true });
    			children(button3).forEach(detach_dev);
    			t6 = claim_space(div1_nodes);
    			button4 = claim_element(div1_nodes, "BUTTON", { class: true });
    			children(button4).forEach(detach_dev);
    			t7 = claim_space(div1_nodes);
    			button5 = claim_element(div1_nodes, "BUTTON", { class: true });
    			children(button5).forEach(detach_dev);
    			t8 = claim_space(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", div0_class_value = "img " + /*mtX*/ ctx[11] + " transition zoom-in-transition" + " svelte-13ni0ri");
    			add_location(div0, file$4, 297, 6, 5649);
    			attr_dev(button0, "class", "control-btn btn-in svelte-13ni0ri");
    			add_location(button0, file$4, 298, 6, 5711);
    			attr_dev(button1, "class", "control-btn btn-out svelte-13ni0ri");
    			add_location(button1, file$4, 299, 6, 5792);
    			attr_dev(button2, "class", "control-btn arrow-left svelte-13ni0ri");
    			add_location(button2, file$4, 302, 6, 5891);
    			attr_dev(button3, "class", "control-btn arrow-up svelte-13ni0ri");
    			add_location(button3, file$4, 303, 6, 5970);
    			attr_dev(button4, "class", "control-btn arrow-down svelte-13ni0ri");
    			add_location(button4, file$4, 304, 6, 6045);
    			attr_dev(button5, "class", "control-btn arrow-right svelte-13ni0ri");
    			add_location(button5, file$4, 305, 6, 6124);
    			attr_dev(div1, "class", "position-relative svelte-13ni0ri");
    			add_location(div1, file$4, 296, 4, 5611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, button0);
    			append_dev(button0, t1);
    			append_dev(div1, t2);
    			append_dev(div1, button1);
    			append_dev(button1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button2);
    			append_dev(div1, t5);
    			append_dev(div1, button3);
    			append_dev(div1, t6);
    			append_dev(div1, button4);
    			append_dev(div1, t7);
    			append_dev(div1, button5);
    			append_dev(div1, t8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false),
    					listen_dev(button1, "click", click_handler_1, false, false, false),
    					listen_dev(button2, "click", click_handler_2, false, false, false),
    					listen_dev(button3, "click", click_handler_3, false, false, false),
    					listen_dev(button4, "click", click_handler_4, false, false, false),
    					listen_dev(button5, "click", click_handler_5, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(296:2) {#each mountains as mtX}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let h20;
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let h3;
    	let t5;
    	let t6;
    	let div0;
    	let t7;
    	let h21;
    	let t8;
    	let t9;
    	let div2;
    	let t10;
    	let div4;
    	let div3;
    	let t11;
    	let button0;
    	let t12;
    	let t13;
    	let button1;
    	let t14;
    	let t15;
    	let button2;
    	let t16;
    	let t17;
    	let footer;
    	let h5;
    	let t18;
    	let t19;
    	let ul;
    	let li;
    	let a;
    	let t20;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*animations*/ ctx[1];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*mountains*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*mountains*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Animations");
    			t1 = space();
    			h20 = element("h2");
    			t2 = text("Several different animations");
    			t3 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t4 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t5 = text("grow");
    			t6 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t7 = space();
    			h21 = element("h2");
    			t8 = text("Controlling transitions");
    			t9 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			div4 = element("div");
    			div3 = element("div");
    			t11 = space();
    			button0 = element("button");
    			t12 = text("Pause");
    			t13 = space();
    			button1 = element("button");
    			t14 = text("Play");
    			t15 = space();
    			button2 = element("button");
    			t16 = text("Reset");
    			t17 = space();
    			footer = element("footer");
    			h5 = element("h5");
    			t18 = text("Usefull links");
    			t19 = space();
    			ul = element("ul");
    			li = element("li");
    			a = element("a");
    			t20 = text("Controlling transitions (css-tricks.com)");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", {});
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Animations");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			h20 = claim_element(nodes, "H2", {});
    			var h20_nodes = children(h20);
    			t2 = claim_text(h20_nodes, "Several different animations");
    			h20_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].l(nodes);
    			}

    			t4 = claim_space(nodes);
    			div1 = claim_element(nodes, "DIV", {});
    			var div1_nodes = children(div1);
    			h3 = claim_element(div1_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t5 = claim_text(h3_nodes, "grow");
    			h3_nodes.forEach(detach_dev);
    			t6 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t7 = claim_space(nodes);
    			h21 = claim_element(nodes, "H2", {});
    			var h21_nodes = children(h21);
    			t8 = claim_text(h21_nodes, "Controlling transitions");
    			h21_nodes.forEach(detach_dev);
    			t9 = claim_space(nodes);
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div2_nodes);
    			}

    			div2_nodes.forEach(detach_dev);
    			t10 = claim_space(nodes);
    			div4 = claim_element(nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			children(div3).forEach(detach_dev);
    			t11 = claim_space(div4_nodes);
    			button0 = claim_element(div4_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			t12 = claim_text(button0_nodes, "Pause");
    			button0_nodes.forEach(detach_dev);
    			t13 = claim_space(div4_nodes);
    			button1 = claim_element(div4_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);
    			t14 = claim_text(button1_nodes, "Play");
    			button1_nodes.forEach(detach_dev);
    			t15 = claim_space(div4_nodes);
    			button2 = claim_element(div4_nodes, "BUTTON", { class: true });
    			var button2_nodes = children(button2);
    			t16 = claim_text(button2_nodes, "Reset");
    			button2_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			t17 = claim_space(nodes);
    			footer = claim_element(nodes, "FOOTER", { class: true });
    			var footer_nodes = children(footer);
    			h5 = claim_element(footer_nodes, "H5", {});
    			var h5_nodes = children(h5);
    			t18 = claim_text(h5_nodes, "Usefull links");
    			h5_nodes.forEach(detach_dev);
    			t19 = claim_space(footer_nodes);
    			ul = claim_element(footer_nodes, "UL", {});
    			var ul_nodes = children(ul);
    			li = claim_element(ul_nodes, "LI", {});
    			var li_nodes = children(li);
    			a = claim_element(li_nodes, "A", { href: true });
    			var a_nodes = children(a);
    			t20 = claim_text(a_nodes, "Controlling transitions (css-tricks.com)");
    			a_nodes.forEach(detach_dev);
    			li_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			footer_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h1, file$4, 264, 0, 4988);
    			add_location(h20, file$4, 266, 0, 5009);
    			add_location(h3, file$4, 281, 2, 5302);
    			attr_dev(div0, "class", "animation-container  svelte-13ni0ri");
    			add_location(div0, file$4, 283, 2, 5319);
    			add_location(div1, file$4, 280, 0, 5294);
    			add_location(h21, file$4, 292, 0, 5512);
    			attr_dev(div2, "class", "animation-container svelte-13ni0ri");
    			add_location(div2, file$4, 294, 0, 5546);
    			attr_dev(div3, "class", "img mt1 transition big-zoom svelte-13ni0ri");
    			add_location(div3, file$4, 311, 2, 6264);
    			attr_dev(button0, "class", " svelte-13ni0ri");
    			add_location(button0, file$4, 312, 2, 6310);
    			attr_dev(button1, "class", " svelte-13ni0ri");
    			add_location(button1, file$4, 313, 2, 6369);
    			attr_dev(button2, "class", " svelte-13ni0ri");
    			add_location(button2, file$4, 314, 2, 6426);
    			attr_dev(div4, "class", "animation-container svelte-13ni0ri");
    			add_location(div4, file$4, 310, 0, 6228);
    			add_location(h5, file$4, 318, 2, 6502);
    			attr_dev(a, "href", "https://css-tricks.com/controlling-css-animations-transitions-javascript/");
    			add_location(a, file$4, 322, 6, 6548);
    			add_location(li, file$4, 321, 4, 6537);
    			add_location(ul, file$4, 320, 2, 6528);
    			attr_dev(footer, "class", "svelte-13ni0ri");
    			add_location(footer, file$4, 317, 0, 6491);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t2);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(target, anchor);
    			}

    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t5);
    			append_dev(div1, t6);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t7, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			insert_dev(target, t10, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div4, t11);
    			append_dev(div4, button0);
    			append_dev(button0, t12);
    			append_dev(div4, t13);
    			append_dev(div4, button1);
    			append_dev(button1, t14);
    			append_dev(div4, t15);
    			append_dev(div4, button2);
    			append_dev(button2, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, h5);
    			append_dev(h5, t18);
    			append_dev(footer, t19);
    			append_dev(footer, ul);
    			append_dev(ul, li);
    			append_dev(li, a);
    			append_dev(a, t20);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_6*/ ctx[8], false, false, false),
    					listen_dev(button1, "click", /*click_handler_7*/ ctx[9], false, false, false),
    					listen_dev(button2, "click", /*click_handler_8*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mountains, animations*/ 3) {
    				each_value_2 = /*animations*/ ctx[1];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(t4.parentNode, t4);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*mountains*/ 1) {
    				each_value_1 = /*mountains*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*moveRight, mountains, moveDown, moveUp, moveLeft, zoomOut, zoomIn*/ 1) {
    				each_value = /*mountains*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(footer);
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

    function zoomIn(selector) {
    	const img1 = document.querySelector(`.img.${selector}.transition`);
    	const size = (img1.style.backgroundSize || "100% auto").split("%")[0];
    	img1.style.backgroundSize = `${size * 1.2}% auto`;
    }

    function zoomOut(selector) {
    	const img1 = document.querySelector(`.img.${selector}.transition`);
    	const size = (img1.style.backgroundSize || "100% auto").split("%")[0];
    	img1.style.backgroundSize = `${size / 1.2}% auto`;
    }

    function getPosition(element) {
    	const positionX = parseInt((element.style.backgroundPosition || "50% 50%").match(/^(-?[0-9]+)%/)[1], 10);
    	const positionY = parseInt((element.style.backgroundPosition || "50% 50%").match(/(-?[0-9]+)%$/)[1], 10);
    	return { positionX, positionY };
    }

    function increase(value) {
    	const increased = value + 10;
    	return increased < 100 ? increased : 100;
    }

    function decrease(value) {
    	const decreased = value - 10;
    	return decreased > 0 ? decreased : 0;
    }

    function moveLeft(selector) {
    	const img1 = document.querySelector(`.img.${selector}.transition`);
    	const { positionX, positionY } = getPosition(img1);
    	img1.style.backgroundPosition = `${decrease(positionX)}% ${positionY}%`;
    }

    function moveRight(selector) {
    	const img1 = document.querySelector(`.img.${selector}.transition`);
    	const { positionX, positionY } = getPosition(img1);
    	img1.style.backgroundPosition = `${increase(positionX)}% ${positionY}%`;
    }

    function moveUp(selector) {
    	const img1 = document.querySelector(`.img.${selector}.transition`);
    	const { positionX, positionY } = getPosition(img1);
    	img1.style.backgroundPosition = `${positionX}% ${decrease(positionY)}%`;
    }

    function moveDown(selector) {
    	const img1 = document.querySelector(`.img.${selector}.transition`);
    	const { positionX, positionY } = getPosition(img1);
    	img1.style.backgroundPosition = `${positionX}% ${increase(positionY)}%`;
    }

    function play() {
    	const el = document.querySelector(".big-zoom");
    	el.style.backgroundSize = "300% auto";
    }

    function pause() {
    	
    }

    function reset() {
    	
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let mountains = ["mt1", "mt2", "mt3", "mt4"];
    	let animations = ["shake", "zoom-in", "zoom-out"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Animation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Animation", $$slots, []);
    	const click_handler = mtX => zoomIn(mtX);
    	const click_handler_1 = mtX => zoomOut(mtX);
    	const click_handler_2 = mtX => moveLeft(mtX);
    	const click_handler_3 = mtX => moveUp(mtX);
    	const click_handler_4 = mtX => moveDown(mtX);
    	const click_handler_5 = mtX => moveRight(mtX);
    	const click_handler_6 = () => pause();
    	const click_handler_7 = () => play();
    	const click_handler_8 = () => reset();

    	$$self.$capture_state = () => ({
    		mountains,
    		animations,
    		zoomIn,
    		zoomOut,
    		getPosition,
    		increase,
    		decrease,
    		moveLeft,
    		moveRight,
    		moveUp,
    		moveDown,
    		play,
    		pause,
    		reset
    	});

    	$$self.$inject_state = $$props => {
    		if ("mountains" in $$props) $$invalidate(0, mountains = $$props.mountains);
    		if ("animations" in $$props) $$invalidate(1, animations = $$props.animations);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		mountains,
    		animations,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8
    	];
    }

    class Animation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Animation",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/ImageEffects.svelte generated by Svelte v3.23.2 */

    const file$5 = "src/components/ImageEffects.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (112:6) {#each mountains as mtX}
    function create_each_block_1$1(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			children(div).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", div_class_value = "img " + /*mtX*/ ctx[5] + " " + /*effect*/ ctx[2] + " svelte-fsalmk");
    			add_location(div, file$5, 112, 8, 1882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(112:6) {#each mountains as mtX}",
    		ctx
    	});

    	return block;
    }

    // (107:0) {#each effects as effect}
    function create_each_block$1(ctx) {
    	let div1;
    	let h3;
    	let t0_value = /*effect*/ ctx[2] + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let each_value_1 = /*mountains*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", {});
    			var div1_nodes = children(div1);
    			h3 = claim_element(div1_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t0 = claim_text(h3_nodes, t0_value);
    			h3_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div0_nodes);
    			}

    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h3, file$5, 108, 4, 1789);
    			attr_dev(div0, "class", "effect-container svelte-fsalmk");
    			add_location(div0, file$5, 110, 4, 1812);
    			add_location(div1, file$5, 107, 2, 1779);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*mountains, effects*/ 3) {
    				each_value_1 = /*mountains*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(107:0) {#each effects as effect}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let each_1_anchor;
    	let each_value = /*effects*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Image Effects");
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("Let's try image filters");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", {});
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Image Effects");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			h2 = claim_element(nodes, "H2", {});
    			var h2_nodes = children(h2);
    			t2 = claim_text(h2_nodes, "Let's try image filters");
    			h2_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h1, file$5, 102, 0, 1693);
    			add_location(h2, file$5, 104, 0, 1717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t2);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*mountains, effects*/ 3) {
    				each_value = /*effects*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
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
    	let mountains = ["mt1", "mt2", "mt3", "mt4"];

    	let effects = [
    		"blur",
    		"brightness-up",
    		"brightness-down",
    		"contrast-up",
    		"contrast-down",
    		"drop-shadow",
    		"grayscale",
    		"hue-rotate",
    		"invert",
    		"opacity",
    		"saturate-up",
    		"saturate-down",
    		"sepia"
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ImageEffects> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ImageEffects", $$slots, []);
    	$$self.$capture_state = () => ({ mountains, effects });

    	$$self.$inject_state = $$props => {
    		if ("mountains" in $$props) $$invalidate(0, mountains = $$props.mountains);
    		if ("effects" in $$props) $$invalidate(1, effects = $$props.effects);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mountains, effects];
    }

    class ImageEffects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImageEffects",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/ImageCutting.svelte generated by Svelte v3.23.2 */

    const file$6 = "src/components/ImageCutting.svelte";

    function create_fragment$8(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let h20;
    	let t2;
    	let t3;
    	let div12;
    	let div1;
    	let h30;
    	let t4;
    	let t5;
    	let div0;
    	let t6;
    	let div3;
    	let h31;
    	let t7;
    	let t8;
    	let div2;
    	let t9;
    	let div5;
    	let h32;
    	let t10;
    	let t11;
    	let div4;
    	let t12;
    	let div7;
    	let h33;
    	let t13;
    	let t14;
    	let div6;
    	let t15;
    	let div9;
    	let h34;
    	let t16;
    	let t17;
    	let div8;
    	let t18;
    	let div11;
    	let h35;
    	let t19;
    	let t20;
    	let div10;
    	let t21;
    	let h21;
    	let t22;
    	let t23;
    	let div14;
    	let div13;
    	let t24;
    	let p0;
    	let t25;
    	let t26;
    	let h22;
    	let t27;
    	let t28;
    	let p1;
    	let t29;
    	let t30;
    	let p2;
    	let t31;
    	let t32;
    	let h23;
    	let t33;
    	let t34;
    	let div18;
    	let div17;
    	let div15;
    	let t35;
    	let div16;
    	let p3;
    	let t36;
    	let t37;
    	let p4;
    	let t38;
    	let t39;
    	let p5;
    	let t40;
    	let t41;
    	let h5;
    	let t42;
    	let t43;
    	let ul;
    	let li0;
    	let a0;
    	let t44;
    	let t45;
    	let li1;
    	let a1;
    	let t46;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Image Cutting");
    			t1 = space();
    			h20 = element("h2");
    			t2 = text("Let's test some image shapes...");
    			t3 = space();
    			div12 = element("div");
    			div1 = element("div");
    			h30 = element("h3");
    			t4 = text("Circle");
    			t5 = space();
    			div0 = element("div");
    			t6 = space();
    			div3 = element("div");
    			h31 = element("h3");
    			t7 = text("Ellipse");
    			t8 = space();
    			div2 = element("div");
    			t9 = space();
    			div5 = element("div");
    			h32 = element("h3");
    			t10 = text("Triangle");
    			t11 = space();
    			div4 = element("div");
    			t12 = space();
    			div7 = element("div");
    			h33 = element("h3");
    			t13 = text("Square");
    			t14 = space();
    			div6 = element("div");
    			t15 = space();
    			div9 = element("div");
    			h34 = element("h3");
    			t16 = text("Pentagon");
    			t17 = space();
    			div8 = element("div");
    			t18 = space();
    			div11 = element("div");
    			h35 = element("h3");
    			t19 = text("Arrow");
    			t20 = space();
    			div10 = element("div");
    			t21 = space();
    			h21 = element("h2");
    			t22 = text("Text around the image");
    			t23 = space();
    			div14 = element("div");
    			div13 = element("div");
    			t24 = space();
    			p0 = element("p");
    			t25 = text("Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic quae minima\n    sunt quos accusantium cupiditate amet doloribus voluptatum sapiente qui,\n    sequi nihil suscipit pariatur repellendus, id quasi fugiat omnis\n    perferendis! Maxime ab doloribus non cupiditate, similique id repudiandae\n    eaque asperiores deleniti assumenda quos eveniet quasi fuga ullam magnam\n    facere molestias dicta cum quidem, vitae sed! Modi molestiae error ab sed?\n    Quaerat, laborum accusamus quia modi consectetur magni incidunt eos vero at\n    pariatur eum sapiente hic nemo sit quod excepturi, qui tenetur! Natus porro\n    eos quaerat non obcaecati libero sint laudantium!");
    			t26 = space();
    			h22 = element("h2");
    			t27 = text("Image in the text");
    			t28 = space();
    			p1 = element("p");
    			t29 = text("GRADIENT inside the text");
    			t30 = space();
    			p2 = element("p");
    			t31 = text("IMAGE inside the text");
    			t32 = space();
    			h23 = element("h2");
    			t33 = text("Image in half container");
    			t34 = space();
    			div18 = element("div");
    			div17 = element("div");
    			div15 = element("div");
    			t35 = space();
    			div16 = element("div");
    			p3 = element("p");
    			t36 = text("Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit explicabo\n        soluta sunt voluptatum illo, temporibus expedita maiores reiciendis\n        vitae, earum reprehenderit commodi repellendus architecto. Doloremque\n        accusamus exercitationem quasi quas? Qui.");
    			t37 = space();
    			p4 = element("p");
    			t38 = text("Quae, consequatur eaque! Ducimus maiores possimus iusto. Sequi dolorem\n        blanditiis fuga, placeat consequatur distinctio magni eveniet, magnam\n        ducimus voluptate nobis molestiae dignissimos facere neque maxime quia\n        explicabo eos odio corrupti.");
    			t39 = space();
    			p5 = element("p");
    			t40 = text("Voluptate dolore ut, earum perferendis, fugit est illo voluptatem\n        mollitia nulla laboriosam suscipit magnam amet reprehenderit atque. Non\n        voluptatibus quod vero ratione, eaque ab corrupti perferendis rerum\n        fugiat exercitationem expedita.");
    			t41 = space();
    			h5 = element("h5");
    			t42 = text("Usefull links");
    			t43 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t44 = text("Create easaly any shape");
    			t45 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t46 = text("Image in the text (css-tricks.com)");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Image Cutting");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			h20 = claim_element(nodes, "H2", { class: true });
    			var h20_nodes = children(h20);
    			t2 = claim_text(h20_nodes, "Let's test some image shapes...");
    			h20_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			div12 = claim_element(nodes, "DIV", { class: true });
    			var div12_nodes = children(div12);
    			div1 = claim_element(div12_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h30 = claim_element(div1_nodes, "H3", { class: true });
    			var h30_nodes = children(h30);
    			t4 = claim_text(h30_nodes, "Circle");
    			h30_nodes.forEach(detach_dev);
    			t5 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t6 = claim_space(div12_nodes);
    			div3 = claim_element(div12_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			h31 = claim_element(div3_nodes, "H3", { class: true });
    			var h31_nodes = children(h31);
    			t7 = claim_text(h31_nodes, "Ellipse");
    			h31_nodes.forEach(detach_dev);
    			t8 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			children(div2).forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			t9 = claim_space(div12_nodes);
    			div5 = claim_element(div12_nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			h32 = claim_element(div5_nodes, "H3", { class: true });
    			var h32_nodes = children(h32);
    			t10 = claim_text(h32_nodes, "Triangle");
    			h32_nodes.forEach(detach_dev);
    			t11 = claim_space(div5_nodes);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			children(div4).forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			t12 = claim_space(div12_nodes);
    			div7 = claim_element(div12_nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			h33 = claim_element(div7_nodes, "H3", { class: true });
    			var h33_nodes = children(h33);
    			t13 = claim_text(h33_nodes, "Square");
    			h33_nodes.forEach(detach_dev);
    			t14 = claim_space(div7_nodes);
    			div6 = claim_element(div7_nodes, "DIV", { class: true });
    			children(div6).forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			t15 = claim_space(div12_nodes);
    			div9 = claim_element(div12_nodes, "DIV", { class: true });
    			var div9_nodes = children(div9);
    			h34 = claim_element(div9_nodes, "H3", { class: true });
    			var h34_nodes = children(h34);
    			t16 = claim_text(h34_nodes, "Pentagon");
    			h34_nodes.forEach(detach_dev);
    			t17 = claim_space(div9_nodes);
    			div8 = claim_element(div9_nodes, "DIV", { class: true });
    			children(div8).forEach(detach_dev);
    			div9_nodes.forEach(detach_dev);
    			t18 = claim_space(div12_nodes);
    			div11 = claim_element(div12_nodes, "DIV", { class: true });
    			var div11_nodes = children(div11);
    			h35 = claim_element(div11_nodes, "H3", { class: true });
    			var h35_nodes = children(h35);
    			t19 = claim_text(h35_nodes, "Arrow");
    			h35_nodes.forEach(detach_dev);
    			t20 = claim_space(div11_nodes);
    			div10 = claim_element(div11_nodes, "DIV", { class: true });
    			children(div10).forEach(detach_dev);
    			div11_nodes.forEach(detach_dev);
    			div12_nodes.forEach(detach_dev);
    			t21 = claim_space(nodes);
    			h21 = claim_element(nodes, "H2", { class: true });
    			var h21_nodes = children(h21);
    			t22 = claim_text(h21_nodes, "Text around the image");
    			h21_nodes.forEach(detach_dev);
    			t23 = claim_space(nodes);
    			div14 = claim_element(nodes, "DIV", { class: true });
    			var div14_nodes = children(div14);
    			div13 = claim_element(div14_nodes, "DIV", { class: true });
    			children(div13).forEach(detach_dev);
    			t24 = claim_space(div14_nodes);
    			p0 = claim_element(div14_nodes, "P", { class: true });
    			var p0_nodes = children(p0);
    			t25 = claim_text(p0_nodes, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic quae minima\n    sunt quos accusantium cupiditate amet doloribus voluptatum sapiente qui,\n    sequi nihil suscipit pariatur repellendus, id quasi fugiat omnis\n    perferendis! Maxime ab doloribus non cupiditate, similique id repudiandae\n    eaque asperiores deleniti assumenda quos eveniet quasi fuga ullam magnam\n    facere molestias dicta cum quidem, vitae sed! Modi molestiae error ab sed?\n    Quaerat, laborum accusamus quia modi consectetur magni incidunt eos vero at\n    pariatur eum sapiente hic nemo sit quod excepturi, qui tenetur! Natus porro\n    eos quaerat non obcaecati libero sint laudantium!");
    			p0_nodes.forEach(detach_dev);
    			div14_nodes.forEach(detach_dev);
    			t26 = claim_space(nodes);
    			h22 = claim_element(nodes, "H2", { class: true });
    			var h22_nodes = children(h22);
    			t27 = claim_text(h22_nodes, "Image in the text");
    			h22_nodes.forEach(detach_dev);
    			t28 = claim_space(nodes);
    			p1 = claim_element(nodes, "P", { class: true });
    			var p1_nodes = children(p1);
    			t29 = claim_text(p1_nodes, "GRADIENT inside the text");
    			p1_nodes.forEach(detach_dev);
    			t30 = claim_space(nodes);
    			p2 = claim_element(nodes, "P", { class: true });
    			var p2_nodes = children(p2);
    			t31 = claim_text(p2_nodes, "IMAGE inside the text");
    			p2_nodes.forEach(detach_dev);
    			t32 = claim_space(nodes);
    			h23 = claim_element(nodes, "H2", { class: true });
    			var h23_nodes = children(h23);
    			t33 = claim_text(h23_nodes, "Image in half container");
    			h23_nodes.forEach(detach_dev);
    			t34 = claim_space(nodes);
    			div18 = claim_element(nodes, "DIV", { class: true });
    			var div18_nodes = children(div18);
    			div17 = claim_element(div18_nodes, "DIV", { class: true });
    			var div17_nodes = children(div17);
    			div15 = claim_element(div17_nodes, "DIV", { class: true });
    			children(div15).forEach(detach_dev);
    			t35 = claim_space(div17_nodes);
    			div16 = claim_element(div17_nodes, "DIV", { class: true });
    			var div16_nodes = children(div16);
    			p3 = claim_element(div16_nodes, "P", { class: true });
    			var p3_nodes = children(p3);
    			t36 = claim_text(p3_nodes, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit explicabo\n        soluta sunt voluptatum illo, temporibus expedita maiores reiciendis\n        vitae, earum reprehenderit commodi repellendus architecto. Doloremque\n        accusamus exercitationem quasi quas? Qui.");
    			p3_nodes.forEach(detach_dev);
    			t37 = claim_space(div16_nodes);
    			p4 = claim_element(div16_nodes, "P", { class: true });
    			var p4_nodes = children(p4);
    			t38 = claim_text(p4_nodes, "Quae, consequatur eaque! Ducimus maiores possimus iusto. Sequi dolorem\n        blanditiis fuga, placeat consequatur distinctio magni eveniet, magnam\n        ducimus voluptate nobis molestiae dignissimos facere neque maxime quia\n        explicabo eos odio corrupti.");
    			p4_nodes.forEach(detach_dev);
    			t39 = claim_space(div16_nodes);
    			p5 = claim_element(div16_nodes, "P", { class: true });
    			var p5_nodes = children(p5);
    			t40 = claim_text(p5_nodes, "Voluptate dolore ut, earum perferendis, fugit est illo voluptatem\n        mollitia nulla laboriosam suscipit magnam amet reprehenderit atque. Non\n        voluptatibus quod vero ratione, eaque ab corrupti perferendis rerum\n        fugiat exercitationem expedita.");
    			p5_nodes.forEach(detach_dev);
    			div16_nodes.forEach(detach_dev);
    			div17_nodes.forEach(detach_dev);
    			div18_nodes.forEach(detach_dev);
    			t41 = claim_space(nodes);
    			h5 = claim_element(nodes, "H5", { class: true });
    			var h5_nodes = children(h5);
    			t42 = claim_text(h5_nodes, "Usefull links");
    			h5_nodes.forEach(detach_dev);
    			t43 = claim_space(nodes);
    			ul = claim_element(nodes, "UL", { class: true });
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", { class: true });
    			var li0_nodes = children(li0);
    			a0 = claim_element(li0_nodes, "A", { href: true, class: true });
    			var a0_nodes = children(a0);
    			t44 = claim_text(a0_nodes, "Create easaly any shape");
    			a0_nodes.forEach(detach_dev);
    			li0_nodes.forEach(detach_dev);
    			t45 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", { class: true });
    			var li1_nodes = children(li1);
    			a1 = claim_element(li1_nodes, "A", { href: true, class: true });
    			var a1_nodes = children(a1);
    			t46 = claim_text(a1_nodes, "Image in the text (css-tricks.com)");
    			a1_nodes.forEach(detach_dev);
    			li1_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "svelte-1iei3jk");
    			add_location(h1, file$6, 116, 0, 2134);
    			attr_dev(h20, "class", "svelte-1iei3jk");
    			add_location(h20, file$6, 118, 0, 2158);
    			attr_dev(h30, "class", "svelte-1iei3jk");
    			add_location(h30, file$6, 122, 4, 2260);
    			attr_dev(div0, "class", "shape-circle img mt1 svelte-1iei3jk");
    			add_location(div0, file$6, 123, 4, 2280);
    			attr_dev(div1, "class", "example svelte-1iei3jk");
    			add_location(div1, file$6, 121, 2, 2234);
    			attr_dev(h31, "class", "svelte-1iei3jk");
    			add_location(h31, file$6, 127, 4, 2355);
    			attr_dev(div2, "class", "shape-ellipse img mt1 svelte-1iei3jk");
    			add_location(div2, file$6, 128, 4, 2376);
    			attr_dev(div3, "class", "example svelte-1iei3jk");
    			add_location(div3, file$6, 126, 2, 2329);
    			attr_dev(h32, "class", "svelte-1iei3jk");
    			add_location(h32, file$6, 132, 4, 2452);
    			attr_dev(div4, "class", "shape-triangle img mt2 svelte-1iei3jk");
    			add_location(div4, file$6, 133, 4, 2474);
    			attr_dev(div5, "class", "example svelte-1iei3jk");
    			add_location(div5, file$6, 131, 2, 2426);
    			attr_dev(h33, "class", "svelte-1iei3jk");
    			add_location(h33, file$6, 137, 4, 2551);
    			attr_dev(div6, "class", "shape-square img mt3 svelte-1iei3jk");
    			add_location(div6, file$6, 138, 4, 2571);
    			attr_dev(div7, "class", "example svelte-1iei3jk");
    			add_location(div7, file$6, 136, 2, 2525);
    			attr_dev(h34, "class", "svelte-1iei3jk");
    			add_location(h34, file$6, 142, 4, 2646);
    			attr_dev(div8, "class", "shape-pentagon img mt4 svelte-1iei3jk");
    			add_location(div8, file$6, 143, 4, 2668);
    			attr_dev(div9, "class", "example svelte-1iei3jk");
    			add_location(div9, file$6, 141, 2, 2620);
    			attr_dev(h35, "class", "svelte-1iei3jk");
    			add_location(h35, file$6, 147, 4, 2745);
    			attr_dev(div10, "class", "shape-arrow img mt3 svelte-1iei3jk");
    			add_location(div10, file$6, 148, 4, 2764);
    			attr_dev(div11, "class", "example svelte-1iei3jk");
    			add_location(div11, file$6, 146, 2, 2719);
    			attr_dev(div12, "class", "example-container svelte-1iei3jk");
    			add_location(div12, file$6, 120, 0, 2200);
    			attr_dev(h21, "class", "svelte-1iei3jk");
    			add_location(h21, file$6, 152, 0, 2817);
    			attr_dev(div13, "class", "dot-shape img shape-circle mt4 svelte-1iei3jk");
    			add_location(div13, file$6, 155, 2, 2888);
    			attr_dev(p0, "class", "paragraph svelte-1iei3jk");
    			add_location(p0, file$6, 156, 2, 2937);
    			attr_dev(div14, "class", "example text-container svelte-1iei3jk");
    			add_location(div14, file$6, 154, 0, 2849);
    			attr_dev(h22, "class", "svelte-1iei3jk");
    			add_location(h22, file$6, 169, 0, 3645);
    			attr_dev(p1, "class", "text-image gradient svelte-1iei3jk");
    			add_location(p1, file$6, 171, 0, 3673);
    			attr_dev(p2, "class", "text-image mt1 svelte-1iei3jk");
    			add_location(p2, file$6, 172, 0, 3733);
    			attr_dev(h23, "class", "svelte-1iei3jk");
    			add_location(h23, file$6, 174, 0, 3786);
    			attr_dev(div15, "class", "half-image-shape svelte-1iei3jk");
    			add_location(div15, file$6, 178, 4, 3873);
    			attr_dev(p3, "class", "svelte-1iei3jk");
    			add_location(p3, file$6, 180, 6, 3946);
    			attr_dev(p4, "class", "svelte-1iei3jk");
    			add_location(p4, file$6, 187, 6, 4251);
    			attr_dev(p5, "class", "svelte-1iei3jk");
    			add_location(p5, file$6, 194, 6, 4546);
    			attr_dev(div16, "class", "half-image-text svelte-1iei3jk");
    			add_location(div16, file$6, 179, 4, 3910);
    			attr_dev(div17, "class", "half-image svelte-1iei3jk");
    			add_location(div17, file$6, 177, 2, 3844);
    			attr_dev(div18, "class", "example svelte-1iei3jk");
    			add_location(div18, file$6, 176, 0, 3820);
    			attr_dev(h5, "class", "svelte-1iei3jk");
    			add_location(h5, file$6, 204, 0, 4859);
    			attr_dev(a0, "href", "https://bennettfeely.com/clippy/");
    			attr_dev(a0, "class", "svelte-1iei3jk");
    			add_location(a0, file$6, 208, 4, 4899);
    			attr_dev(li0, "class", "svelte-1iei3jk");
    			add_location(li0, file$6, 207, 2, 4890);
    			attr_dev(a1, "href", "https://css-tricks.com/how-to-do-knockout-text/");
    			attr_dev(a1, "class", "svelte-1iei3jk");
    			add_location(a1, file$6, 211, 4, 4989);
    			attr_dev(li1, "class", "svelte-1iei3jk");
    			add_location(li1, file$6, 210, 2, 4980);
    			attr_dev(ul, "class", "svelte-1iei3jk");
    			add_location(ul, file$6, 206, 0, 4883);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div12, anchor);
    			append_dev(div12, div1);
    			append_dev(div1, h30);
    			append_dev(h30, t4);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div12, t6);
    			append_dev(div12, div3);
    			append_dev(div3, h31);
    			append_dev(h31, t7);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div12, t9);
    			append_dev(div12, div5);
    			append_dev(div5, h32);
    			append_dev(h32, t10);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div12, t12);
    			append_dev(div12, div7);
    			append_dev(div7, h33);
    			append_dev(h33, t13);
    			append_dev(div7, t14);
    			append_dev(div7, div6);
    			append_dev(div12, t15);
    			append_dev(div12, div9);
    			append_dev(div9, h34);
    			append_dev(h34, t16);
    			append_dev(div9, t17);
    			append_dev(div9, div8);
    			append_dev(div12, t18);
    			append_dev(div12, div11);
    			append_dev(div11, h35);
    			append_dev(h35, t19);
    			append_dev(div11, t20);
    			append_dev(div11, div10);
    			insert_dev(target, t21, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t22);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div14, anchor);
    			append_dev(div14, div13);
    			append_dev(div14, t24);
    			append_dev(div14, p0);
    			append_dev(p0, t25);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, h22, anchor);
    			append_dev(h22, t27);
    			insert_dev(target, t28, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t29);
    			insert_dev(target, t30, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t31);
    			insert_dev(target, t32, anchor);
    			insert_dev(target, h23, anchor);
    			append_dev(h23, t33);
    			insert_dev(target, t34, anchor);
    			insert_dev(target, div18, anchor);
    			append_dev(div18, div17);
    			append_dev(div17, div15);
    			append_dev(div17, t35);
    			append_dev(div17, div16);
    			append_dev(div16, p3);
    			append_dev(p3, t36);
    			append_dev(div16, t37);
    			append_dev(div16, p4);
    			append_dev(p4, t38);
    			append_dev(div16, t39);
    			append_dev(div16, p5);
    			append_dev(p5, t40);
    			insert_dev(target, t41, anchor);
    			insert_dev(target, h5, anchor);
    			append_dev(h5, t42);
    			insert_dev(target, t43, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t44);
    			append_dev(ul, t45);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t46);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div12);
    			if (detaching) detach_dev(t21);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div14);
    			if (detaching) detach_dev(t26);
    			if (detaching) detach_dev(h22);
    			if (detaching) detach_dev(t28);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t30);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t32);
    			if (detaching) detach_dev(h23);
    			if (detaching) detach_dev(t34);
    			if (detaching) detach_dev(div18);
    			if (detaching) detach_dev(t41);
    			if (detaching) detach_dev(h5);
    			if (detaching) detach_dev(t43);
    			if (detaching) detach_dev(ul);
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

    function instance$8($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ImageCutting> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ImageCutting", $$slots, []);
    	return [];
    }

    class ImageCutting extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImageCutting",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/Parallax.svelte generated by Svelte v3.23.2 */

    const file$7 = "src/components/Parallax.svelte";

    function create_fragment$9(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let div7;
    	let div0;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let div2;
    	let t5;
    	let div3;
    	let t6;
    	let t7;
    	let div4;
    	let t8;
    	let div5;
    	let t9;
    	let t10;
    	let div6;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Parallax");
    			t1 = space();
    			div7 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			t3 = text("Lorem ipsum dolor sit, amet consectetur adipisicing elit. At necessitatibus\n    dicta, quia ipsum, perferendis facere animi voluptate unde velit dolor culpa\n    consectetur expedita doloremque corrupti! Dolore qui fugit facere deleniti?\n    Quidem, iusto? Ut nemo recusandae eos quaerat labore, molestias eum eveniet\n    similique officiis incidunt vel esse culpa vitae maxime suscipit dolores\n    perferendis dolor repellat soluta inventore voluptates consectetur! Animi,\n    modi! Quos quae repellat, ad perspiciatis corrupti nulla nisi ratione fuga\n    quaerat voluptate aspernatur similique molestiae minima qui rem aliquid.\n    Facilis molestiae a tempore impedit mollitia praesentium libero, labore\n    corporis nihil.");
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div3 = element("div");
    			t6 = text("Lorem ipsum dolor sit, amet consectetur adipisicing elit. At necessitatibus\n    dicta, quia ipsum, perferendis facere animi voluptate unde velit dolor culpa\n    consectetur expedita doloremque corrupti! Dolore qui fugit facere deleniti?\n    Quidem, iusto? Ut nemo recusandae eos quaerat labore, molestias eum eveniet\n    similique officiis incidunt vel esse culpa vitae maxime suscipit dolores\n    perferendis dolor repellat soluta inventore voluptates consectetur! Animi,\n    modi! Quos quae repellat, ad perspiciatis corrupti nulla nisi ratione fuga\n    quaerat voluptate aspernatur similique molestiae minima qui rem aliquid.\n    Facilis molestiae a tempore impedit mollitia praesentium libero, labore\n    corporis nihil.");
    			t7 = space();
    			div4 = element("div");
    			t8 = space();
    			div5 = element("div");
    			t9 = text("Lorem ipsum dolor sit, amet consectetur adipisicing elit. At necessitatibus\n    dicta, quia ipsum, perferendis facere animi voluptate unde velit dolor culpa\n    consectetur expedita doloremque corrupti! Dolore qui fugit facere deleniti?\n    Quidem, iusto? Ut nemo recusandae eos quaerat labore, molestias eum eveniet\n    similique officiis incidunt vel esse culpa vitae maxime suscipit dolores\n    perferendis dolor repellat soluta inventore voluptates consectetur! Animi,\n    modi! Quos quae repellat, ad perspiciatis corrupti nulla nisi ratione fuga\n    quaerat voluptate aspernatur similique molestiae minima qui rem aliquid.\n    Facilis molestiae a tempore impedit mollitia praesentium libero, labore\n    corporis nihil.");
    			t10 = space();
    			div6 = element("div");
    			this.h();
    		},
    		l: function claim(nodes) {
    			h1 = claim_element(nodes, "H1", {});
    			var h1_nodes = children(h1);
    			t0 = claim_text(h1_nodes, "Parallax");
    			h1_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			div7 = claim_element(nodes, "DIV", { class: true });
    			var div7_nodes = children(div7);
    			div0 = claim_element(div7_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t2 = claim_space(div7_nodes);
    			div1 = claim_element(div7_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			t3 = claim_text(div1_nodes, "Lorem ipsum dolor sit, amet consectetur adipisicing elit. At necessitatibus\n    dicta, quia ipsum, perferendis facere animi voluptate unde velit dolor culpa\n    consectetur expedita doloremque corrupti! Dolore qui fugit facere deleniti?\n    Quidem, iusto? Ut nemo recusandae eos quaerat labore, molestias eum eveniet\n    similique officiis incidunt vel esse culpa vitae maxime suscipit dolores\n    perferendis dolor repellat soluta inventore voluptates consectetur! Animi,\n    modi! Quos quae repellat, ad perspiciatis corrupti nulla nisi ratione fuga\n    quaerat voluptate aspernatur similique molestiae minima qui rem aliquid.\n    Facilis molestiae a tempore impedit mollitia praesentium libero, labore\n    corporis nihil.");
    			div1_nodes.forEach(detach_dev);
    			t4 = claim_space(div7_nodes);
    			div2 = claim_element(div7_nodes, "DIV", { class: true });
    			children(div2).forEach(detach_dev);
    			t5 = claim_space(div7_nodes);
    			div3 = claim_element(div7_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			t6 = claim_text(div3_nodes, "Lorem ipsum dolor sit, amet consectetur adipisicing elit. At necessitatibus\n    dicta, quia ipsum, perferendis facere animi voluptate unde velit dolor culpa\n    consectetur expedita doloremque corrupti! Dolore qui fugit facere deleniti?\n    Quidem, iusto? Ut nemo recusandae eos quaerat labore, molestias eum eveniet\n    similique officiis incidunt vel esse culpa vitae maxime suscipit dolores\n    perferendis dolor repellat soluta inventore voluptates consectetur! Animi,\n    modi! Quos quae repellat, ad perspiciatis corrupti nulla nisi ratione fuga\n    quaerat voluptate aspernatur similique molestiae minima qui rem aliquid.\n    Facilis molestiae a tempore impedit mollitia praesentium libero, labore\n    corporis nihil.");
    			div3_nodes.forEach(detach_dev);
    			t7 = claim_space(div7_nodes);
    			div4 = claim_element(div7_nodes, "DIV", { class: true });
    			children(div4).forEach(detach_dev);
    			t8 = claim_space(div7_nodes);
    			div5 = claim_element(div7_nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			t9 = claim_text(div5_nodes, "Lorem ipsum dolor sit, amet consectetur adipisicing elit. At necessitatibus\n    dicta, quia ipsum, perferendis facere animi voluptate unde velit dolor culpa\n    consectetur expedita doloremque corrupti! Dolore qui fugit facere deleniti?\n    Quidem, iusto? Ut nemo recusandae eos quaerat labore, molestias eum eveniet\n    similique officiis incidunt vel esse culpa vitae maxime suscipit dolores\n    perferendis dolor repellat soluta inventore voluptates consectetur! Animi,\n    modi! Quos quae repellat, ad perspiciatis corrupti nulla nisi ratione fuga\n    quaerat voluptate aspernatur similique molestiae minima qui rem aliquid.\n    Facilis molestiae a tempore impedit mollitia praesentium libero, labore\n    corporis nihil.");
    			div5_nodes.forEach(detach_dev);
    			t10 = claim_space(div7_nodes);
    			div6 = claim_element(div7_nodes, "DIV", { class: true });
    			children(div6).forEach(detach_dev);
    			div7_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(h1, file$7, 28, 0, 420);
    			attr_dev(div0, "class", "parallax mt1 svelte-1mfbqlk");
    			add_location(div0, file$7, 31, 2, 474);
    			attr_dev(div1, "class", "description svelte-1mfbqlk");
    			add_location(div1, file$7, 33, 2, 506);
    			attr_dev(div2, "class", "parallax mt2 svelte-1mfbqlk");
    			add_location(div2, file$7, 46, 2, 1273);
    			attr_dev(div3, "class", "description svelte-1mfbqlk");
    			add_location(div3, file$7, 48, 2, 1305);
    			attr_dev(div4, "class", "parallax mt3 svelte-1mfbqlk");
    			add_location(div4, file$7, 61, 2, 2072);
    			attr_dev(div5, "class", "description svelte-1mfbqlk");
    			add_location(div5, file$7, 63, 2, 2104);
    			attr_dev(div6, "class", "parallax mt4 svelte-1mfbqlk");
    			add_location(div6, file$7, 76, 2, 2871);
    			attr_dev(div7, "class", "parallax-container svelte-1mfbqlk");
    			add_location(div7, file$7, 30, 0, 439);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div0);
    			append_dev(div7, t2);
    			append_dev(div7, div1);
    			append_dev(div1, t3);
    			append_dev(div7, t4);
    			append_dev(div7, div2);
    			append_dev(div7, t5);
    			append_dev(div7, div3);
    			append_dev(div3, t6);
    			append_dev(div7, t7);
    			append_dev(div7, div4);
    			append_dev(div7, t8);
    			append_dev(div7, div5);
    			append_dev(div5, t9);
    			append_dev(div7, t10);
    			append_dev(div7, div6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div7);
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

    function instance$9($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Parallax> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Parallax", $$slots, []);
    	return [];
    }

    class Parallax extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Parallax",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.23.2 */
    const file$8 = "src/App.svelte";

    // (29:6) <Route let:params path="about">
    function create_default_slot_6(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(about.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(29:6) <Route let:params path=\\\"about\\\">",
    		ctx
    	});

    	return block;
    }

    // (30:6) <Route let:params path="/">
    function create_default_slot_5(ctx) {
    	let testing;
    	let current;
    	const testing_spread_levels = [/*bundle*/ ctx[1]];
    	let testing_props = {};

    	for (let i = 0; i < testing_spread_levels.length; i += 1) {
    		testing_props = assign(testing_props, testing_spread_levels[i]);
    	}

    	testing = new Testing({ props: testing_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(testing.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(testing.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(testing, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const testing_changes = (dirty & /*bundle*/ 2)
    			? get_spread_update(testing_spread_levels, [get_spread_object(/*bundle*/ ctx[1])])
    			: {};

    			testing.$set(testing_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(testing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(testing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(testing, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(30:6) <Route let:params path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (31:6) <Route let:params path="animation">
    function create_default_slot_4(ctx) {
    	let animation;
    	let current;
    	animation = new Animation({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(animation.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(animation.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(animation, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(animation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(animation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(animation, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(31:6) <Route let:params path=\\\"animation\\\">",
    		ctx
    	});

    	return block;
    }

    // (32:6) <Route let:params path="image-effects">
    function create_default_slot_3(ctx) {
    	let imageeffects;
    	let current;
    	imageeffects = new ImageEffects({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(imageeffects.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(imageeffects.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(imageeffects, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(imageeffects.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(imageeffects.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(imageeffects, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(32:6) <Route let:params path=\\\"image-effects\\\">",
    		ctx
    	});

    	return block;
    }

    // (33:6) <Route let:params path="image-cutting">
    function create_default_slot_2(ctx) {
    	let imagecutting;
    	let current;
    	imagecutting = new ImageCutting({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(imagecutting.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(imagecutting.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(imagecutting, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(imagecutting.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(imagecutting.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(imagecutting, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(33:6) <Route let:params path=\\\"image-cutting\\\">",
    		ctx
    	});

    	return block;
    }

    // (34:6) <Route let:params path="parallax">
    function create_default_slot_1(ctx) {
    	let parallax;
    	let current;
    	parallax = new Parallax({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(parallax.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(parallax.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(parallax, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(parallax.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(parallax.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(parallax, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(34:6) <Route let:params path=\\\"parallax\\\">",
    		ctx
    	});

    	return block;
    }

    // (26:2) <Router {url}>
    function create_default_slot(ctx) {
    	let navigation;
    	let t0;
    	let main;
    	let route0;
    	let t1;
    	let route1;
    	let t2;
    	let route2;
    	let t3;
    	let route3;
    	let t4;
    	let route4;
    	let t5;
    	let route5;
    	let current;
    	navigation = new Navigation({ $$inline: true });

    	route0 = new Route({
    			props: {
    				path: "about",
    				$$slots: {
    					default: [
    						create_default_slot_6,
    						({ params }) => ({ 2: params }),
    						({ params }) => params ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "/",
    				$$slots: {
    					default: [
    						create_default_slot_5,
    						({ params }) => ({ 2: params }),
    						({ params }) => params ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "animation",
    				$$slots: {
    					default: [
    						create_default_slot_4,
    						({ params }) => ({ 2: params }),
    						({ params }) => params ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "image-effects",
    				$$slots: {
    					default: [
    						create_default_slot_3,
    						({ params }) => ({ 2: params }),
    						({ params }) => params ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "image-cutting",
    				$$slots: {
    					default: [
    						create_default_slot_2,
    						({ params }) => ({ 2: params }),
    						({ params }) => params ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route5 = new Route({
    			props: {
    				path: "parallax",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ params }) => ({ 2: params }),
    						({ params }) => params ? 4 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(navigation.$$.fragment);
    			t0 = space();
    			main = element("main");
    			create_component(route0.$$.fragment);
    			t1 = space();
    			create_component(route1.$$.fragment);
    			t2 = space();
    			create_component(route2.$$.fragment);
    			t3 = space();
    			create_component(route3.$$.fragment);
    			t4 = space();
    			create_component(route4.$$.fragment);
    			t5 = space();
    			create_component(route5.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			claim_component(navigation.$$.fragment, nodes);
    			t0 = claim_space(nodes);
    			main = claim_element(nodes, "MAIN", {});
    			var main_nodes = children(main);
    			claim_component(route0.$$.fragment, main_nodes);
    			t1 = claim_space(main_nodes);
    			claim_component(route1.$$.fragment, main_nodes);
    			t2 = claim_space(main_nodes);
    			claim_component(route2.$$.fragment, main_nodes);
    			t3 = claim_space(main_nodes);
    			claim_component(route3.$$.fragment, main_nodes);
    			t4 = claim_space(main_nodes);
    			claim_component(route4.$$.fragment, main_nodes);
    			t5 = claim_space(main_nodes);
    			claim_component(route5.$$.fragment, main_nodes);
    			main_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(main, file$8, 27, 4, 715);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navigation, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(route0, main, null);
    			append_dev(main, t1);
    			mount_component(route1, main, null);
    			append_dev(main, t2);
    			mount_component(route2, main, null);
    			append_dev(main, t3);
    			mount_component(route3, main, null);
    			append_dev(main, t4);
    			mount_component(route4, main, null);
    			append_dev(main, t5);
    			mount_component(route5, main, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    			const route5_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navigation.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navigation.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navigation, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(route0);
    			destroy_component(route1);
    			destroy_component(route2);
    			destroy_component(route3);
    			destroy_component(route4);
    			destroy_component(route5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(26:2) <Router {url}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(router.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			claim_component(router.$$.fragment, div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div, "class", "layout svelte-1sb3atu");
    			add_location(div, file$8, 24, 0, 654);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(router, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 8) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(router);
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
    	let { url = "" } = $$props;
    	const bundle = { firstName: "FN", lastName: "LN" };
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		Link,
    		Testing,
    		Navigation,
    		About,
    		Animation,
    		ImageEffects,
    		ImageCutting,
    		Parallax,
    		url,
    		bundle
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, bundle];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // main.js

    const app = new App({
        target: document.body,
        hydrate: true
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
