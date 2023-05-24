import { useEffect, useReducer, useRef } from 'preact/hooks';
import { Component, render, FunctionComponent, VNode } from "preact";
import { toastManager } from './toast';
import './index.css';
import { actionTypes, optionTypes, contentTypes } from './types/preact-tiny-toast';

const ADD = 'ADD';
const REMOVE = 'REMOVE';

interface PortalProps {
    children: (node: Element | null) => VNode | null;
}


class Portal extends Component<PortalProps> {
  defaultNode: HTMLDivElement | null = null;
  toastRootElementId = 'preact-tiny-toast-main-container';
  componentDidMount() {
    this.renderPortal();
  }

  componentDidUpdate() {
    this.renderPortal();
  }

  componentWillUnmount() {
    if (this.defaultNode) {
      document.body.removeChild(this.defaultNode);
      this.defaultNode = null;
    }
  }

  renderPortal() {
    if (!this.defaultNode) {
      // Check if an element with the specified id already exists
      let existingNode = document.getElementById(this.toastRootElementId) as HTMLDivElement;
      if (existingNode) {
        // If the element already exists, use it
        this.defaultNode = existingNode;
      } else {
        // If not, create a new div and add it to the document body
        this.defaultNode = document.createElement('div');
        this.defaultNode.id = this.toastRootElementId; // Set the id of the new div
        document.body.appendChild(this.defaultNode);
      }
    }

    let children: ((node: Element | null) => VNode<{}> | null) | VNode<{}> | null = this.props.children;
    let renderedChildren: VNode | null;


    // Check if this.props.children is a function and call it with this.defaultNode.
    if (typeof children === 'function') {
      renderedChildren = children(this.defaultNode);
    } else {
      renderedChildren = children;
    }

    if (renderedChildren !== null) {
      render(renderedChildren, this.defaultNode);
    }
  }

  render() {
    return null;
  }
}

interface StateTypes extends optionTypes {
  content?: contentTypes;
}

interface MapperValuesInterface extends optionTypes{
  content: contentTypes
}
interface ActionsInterface {
  type: actionTypes;
  data: StateTypes;
}

const reducer = (state: StateTypes[], action: ActionsInterface) => {
  const { type, data } = action;
  if(type === ADD) {
    if(state.filter(i => i.uniqueCode && i.uniqueCode === data.uniqueCode).length) {
      return state;
    }
    return [...state, data]
  } else if(type === REMOVE) {
    return state.filter(i => i.id !== data.id)
  }
  return state;
}

const ToastContainer: FunctionComponent = () => {
  const [data, dispatch] = useReducer(reducer, []);

  const callback = (actionType: actionTypes, content: contentTypes, options: optionTypes) => {
    if(actionType === ADD) {
      dispatch({ type: ADD, data: { content, ...options, key: `${options.id}` }})
    }
    if(options.pause && actionType === REMOVE) {
        dispatch({ type: REMOVE, data: {id: options.id}})
    } else if(!options.pause) {
      window.setTimeout(() => {
        dispatch({ type: REMOVE, data: {id: options.id} })
      }, options.timeout)
    }
  }

  useEffect(() => {
    toastManager.subscribe(callback)
  }, []);

  const positionMaintainer = (): any => {
    const mapper: any = {}
    data.forEach(({ position, ...rest }: optionTypes) => {
      if(position) {
        if(!mapper[position]) mapper[position] = []
        mapper[position].push(rest)
      }
    })
    return mapper;
  }

  const markup = () => {
    const mapper = positionMaintainer()
    return Object.keys(mapper).map((position, index) => {
      const content = mapper[position].map(({ key, content, variant, className }: MapperValuesInterface) => {
        let animationCssClass = 'toast-item-animation-top';
        if(position.indexOf('bottom')) animationCssClass = 'toast-item-animation-bottom';
        return (
            <div key={key} className={`toast-item toast-item-${variant} ${animationCssClass} ${className ? className : ''}`}>
              {content}
            </div>
        );
      });
      return (
        <div key={index} className={`toast-container ${position}`}>
          {content}
        </div>
      )
    })
  }

  return (
      <Portal>
        {() => {
          const elements = markup();
          return (<>{elements}</>);
        }}
      </Portal>
  );
}

export default ToastContainer;
