import { useEffect, useReducer, useRef } from 'preact/hooks';
import { h, Component, render, FunctionComponent } from "preact";
import { toastManager } from './toast';
import './index.css';
import { actionTypes, optionTypes, contentTypes } from './types/preact-tiny-toast';

const ADD = 'ADD';
const REMOVE = 'REMOVE';

interface PortalProps {
    children: (node: Element | null) => preact.VNode | null;
}


class Portal extends Component<PortalProps> {
  defaultNode: HTMLDivElement | null = null;
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
      this.defaultNode = document.createElement('div');
      document.body.appendChild(this.defaultNode);
    }

    let children: ((node: Element | null) => preact.VNode<{}> | null) | preact.VNode<{}> | null = this.props.children;
    let renderedChildren: preact.VNode | null;


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
  const toastRootElementId = 'preact-tiny-toast-main-container'
  const [data, dispatch] = useReducer(reducer, [])
  const toastRef = useRef<Element | null>(null)

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
  }, [])

  useEffect((): any => {
    const node = document.createElement('div')
    node.setAttribute('id', toastRootElementId)
    document.body.appendChild(node)
    toastRef.current = node;
    return () => document.body.removeChild(node)
  }, [])

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

  if(!toastRef.current) return null;
  return (
      <Portal>
        {(node) => {
          toastRef.current = node;
          const elements = markup();
          return (<>{elements}</>);
        }}
      </Portal>
  );
}

export default ToastContainer;
