/* eslint-disable @typescript-eslint/no-unused-vars */
import Vue, { VNode } from 'vue'
import { ComponentRenderProxy } from '@vue/composition-api'

declare global {
  namespace JSX {
    interface InputEvent extends Event {
      target: HTMLInputElement
    }
    interface ElementEvent extends Event {
      target: HTMLElement
    }

    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends ComponentRenderProxy {}
    interface ElementAttributesProperty {
      $props: any // specify the property name to use
    }
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}
