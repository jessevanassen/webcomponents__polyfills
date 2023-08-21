import {expect} from '@open-wc/testing';

import {
  getTestElement,
  getObservedAttributesTestElement,
  getShadowRoot,
  getHTML,
} from './utils.js';

describe('Element', () => {
  describe('global registry', () => {
    describe('innerHTML', () => {
      it('should upgrade an element defined in the global registry', () => {
        const {tagName, CustomElementClass} = getTestElement();
        customElements.define(tagName, CustomElementClass);
        const $el = getHTML('<div></div>');

        $el.innerHTML = `<${tagName}></${tagName}>`;

        expect($el.firstElementChild).to.be.instanceof(CustomElementClass);
      });

      it(`shouldn't upgrade an element defined in a custom registry`, () => {
        const {tagName, CustomElementClass} = getTestElement();
        const registry = new CustomElementRegistry();
        registry.define(tagName, CustomElementClass);
        const $el = getHTML('<div></div>');

        $el.innerHTML = `<${tagName}></${tagName}>`;

        expect($el.firstElementChild).to.not.be.instanceof(CustomElementClass);
      });
    });

    describe('insertAdjacentHTML', () => {
      it('should upgrade an element defined in the global registry', () => {
        const {tagName, CustomElementClass} = getTestElement();
        customElements.define(tagName, CustomElementClass);
        const $el = getHTML('<div></div>');

        $el.insertAdjacentHTML('afterbegin', `<${tagName}></${tagName}>`);

        expect($el.firstElementChild).to.be.instanceof(CustomElementClass);
      });

      it(`shouldn't upgrade an element defined in a custom registry`, () => {
        const {tagName, CustomElementClass} = getTestElement();
        const registry = new CustomElementRegistry();
        registry.define(tagName, CustomElementClass);
        const $el = getHTML('<div></div>');

        $el.insertAdjacentHTML('afterbegin', `<${tagName}></${tagName}>`);

        expect($el.firstElementChild).to.not.be.instanceof(CustomElementClass);
      });
    });
  });

  describe('custom registry', () => {
    describe('innerHTML', () => {
      it('should upgrade an element defined in the custom registry', () => {
        const {tagName, CustomElementClass} = getTestElement();
        const registry = new CustomElementRegistry();
        const shadowRoot = getShadowRoot(registry);
        const $el = getHTML('<div></div>', shadowRoot);
        registry.define(tagName, CustomElementClass);

        $el.innerHTML = `<${tagName}></${tagName}>`;

        expect($el.firstElementChild).to.be.instanceof(CustomElementClass);
      });

      it(`shouldn't upgrade an element defined in the global registry`, () => {
        const {tagName, CustomElementClass} = getTestElement();
        const registry = new CustomElementRegistry();
        const shadowRoot = getShadowRoot(registry);
        const $el = getHTML('<div></div>', shadowRoot);
        customElements.define(tagName, CustomElementClass);

        $el.innerHTML = `<${tagName}></${tagName}>`;

        expect($el.firstElementChild).to.not.be.instanceof(CustomElementClass);
      });
    });
  });

  describe('insertAdjacentHTML', () => {
    it('should upgrade an element defined in the custom registry', () => {
      const {tagName, CustomElementClass} = getTestElement();
      const registry = new CustomElementRegistry();
      const shadowRoot = getShadowRoot(registry);
      const $el = getHTML('<div></div>', shadowRoot);
      registry.define(tagName, CustomElementClass);

      $el.insertAdjacentHTML('afterbegin', `<${tagName}></${tagName}>`);

      expect($el.firstElementChild).to.be.instanceof(CustomElementClass);
    });

    it(`shouldn't upgrade an element defined in the global registry`, () => {
      const {tagName, CustomElementClass} = getTestElement();
      const registry = new CustomElementRegistry();
      const shadowRoot = getShadowRoot(registry);
      const $el = getHTML('<div></div>', shadowRoot);
      customElements.define(tagName, CustomElementClass);

      $el.insertAdjacentHTML('afterbegin', `<${tagName}></${tagName}>`);

      expect($el.firstElementChild).to.not.be.instanceof(CustomElementClass);
    });
  });

  describe('attributes', () => {
    it('should call setAttribute', () => {
      const {tagName, CustomElementClass} = getObservedAttributesTestElement([
        'foo',
      ]);
      customElements.define(tagName, CustomElementClass);
      const $el = document.createElement(tagName);

      $el.setAttribute('foo', 'bar');

      expect($el.getAttribute('foo')).to.equal('bar');
    });

    it('should call removeAttribute', () => {
      const {tagName, CustomElementClass} = getObservedAttributesTestElement([
        'foo',
      ]);
      customElements.define(tagName, CustomElementClass);
      const $el = getHTML(`<${tagName} foo></${tagName}>`);

      $el.removeAttribute('foo');

      expect($el.hasAttribute('foo')).to.be.false;
    });

    it('should call toggleAttribute', () => {
      const {tagName, CustomElementClass} = getObservedAttributesTestElement([
        'foo',
      ]);
      customElements.define(tagName, CustomElementClass);
      const $el = document.createElement(tagName);

      $el.toggleAttribute('foo', false);

      expect($el.hasAttribute('foo')).to.be.false;

      $el.setAttribute('foo', '');
      $el.toggleAttribute('foo', true);

      expect($el.hasAttribute('foo')).to.be.true;
    });

    it('should call setAttributeNode', () => {
      const {tagName, CustomElementClass} = getObservedAttributesTestElement([
        'foo',
      ]);
      customElements.define(tagName, CustomElementClass);
      const $el = document.createElement(tagName);

      const attr = document.createAttribute('foo');
      attr.value = 'bar';
      $el.setAttributeNode(attr);

      expect($el.getAttribute('foo')).to.equal('bar');

      /* Updating a node's value after it has been added to an element should
       * update the attribute's value. */
      attr.value = 'baz';
      expect($el.getAttribute('foo')).to.equal('baz');
    });

    it('setAttributeNode should trigger attributeChangedCallback', () => {
      const {tagName, CustomElementClass} = getObservedAttributesTestElement([
        'foo',
      ]);
      customElements.define(tagName, CustomElementClass);
      const $el = document.createElement(tagName);

      const attr = document.createAttribute('foo');
      attr.value = 'bar';
      $el.setAttributeNode(attr);
      attr.value = 'baz';

      expect($el.changedAttributes).to.deep.equal([
        {
          name: 'foo',
          oldValue: null,
          newValue: 'bar',
        },
        {
          name: 'foo',
          oldValue: 'bar',
          newValue: 'baz',
        },
      ]);
    });

    it('changing an existing attribute should trigger attributeChangedCallback', () => {
      const {tagName, CustomElementClass} = getObservedAttributesTestElement([
        'foo',
        'bar',
      ]);
      customElements.define(tagName, CustomElementClass);
      const $el = getHTML(`<${tagName} foo="value 1"></${tagName}>`);
      $el.setAttribute('bar', 'value 1');

      $el.getAttributeNode('foo').value = 'value 2';
      $el.getAttributeNode('bar').value = 'value 2';

      expect($el.changedAttributes.slice(2)).to.deep.equal([
        {
          name: 'foo',
          oldValue: 'value 1',
          newValue: 'value 2',
        },
        {
          name: 'bar',
          oldValue: 'value 1',
          newValue: 'value 2',
        },
      ]);
    });

    it('iterating over attributes and changing them should trigger attributeChangedCallback', () => {
      const {tagName, CustomElementClass} = getObservedAttributesTestElement([
        'foo',
        'bar',
      ]);
      customElements.define(tagName, CustomElementClass);
      const $el = getHTML(`<${tagName} foo="value 1"></${tagName}>`);
      $el.setAttribute('bar', 'value 1');

      for (const attr of $el.attributes) {
        attr.value = 'value 2';
      }

      expect($el.changedAttributes.slice(2)).to.deep.equal([
        {
          name: 'foo',
          oldValue: 'value 1',
          newValue: 'value 2',
        },
        {
          name: 'bar',
          oldValue: 'value 1',
          newValue: 'value 2',
        },
      ]);
    });

    it('should call removeAttributeNode', () => {
      const {tagName, CustomElementClass} = getObservedAttributesTestElement([
        'foo',
      ]);
      customElements.define(tagName, CustomElementClass);
      const $el = document.createElement(tagName);

      const attr = document.createAttribute('foo');
      attr.value = 'bar';
      $el.setAttributeNode(attr);

      $el.removeAttributeNode(attr);
      expect($el.hasAttribute('foo')).to.be.false;
    });

    it('removeAttributeNode should trigger attributeChangedCallback', () => {
      const {tagName, CustomElementClass} = getObservedAttributesTestElement([
        'foo',
      ]);
      customElements.define(tagName, CustomElementClass);
      const $el = getHTML(`<${tagName} foo="value"></${tagName}>`);
      $el.removeAttributeNode($el.getAttributeNode('foo'));

      expect($el.changedAttributes).to.deep.equal([
        {
          name: 'foo',
          oldValue: null,
          newValue: 'value',
        },
        {
          name: 'foo',
          oldValue: 'value',
          newValue: null,
        },
      ]);
    });
  });
});
