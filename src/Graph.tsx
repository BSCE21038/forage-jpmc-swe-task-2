import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement {
  load: (table: Table) => void,
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    const elem: PerspectiveViewerElement = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    if (this.table) {
      const data = this.props.data.map((el: any) => {
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      });

      // Aggregate duplicated data based on timestamp
      const uniqueData = new Map();
      data.forEach(item => {
        const key = item.timestamp;
        if (!uniqueData.has(key)) {
          uniqueData.set(key, item);
        } else {
          const existing = uniqueData.get(key);
          uniqueData.set(key, {
            ...existing,
            top_ask_price: (existing.top_ask_price + item.top_ask_price) / 2,
            top_bid_price: (existing.top_bid_price + item.top_bid_price) / 2,
          });
        }
      });

      this.table.update(Array.from(uniqueData.values()));
    }
  }
}

export default Graph;
