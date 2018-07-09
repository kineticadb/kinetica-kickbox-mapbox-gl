
//////////////////////////////
// Class Declaration
//////////////////////////////

// #region

class KickboxCbLegendControl {
  constructor(title, breaks, colors) {
    this.title = title;
    this.breaks = breaks;
    this.colors = colors;
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl kickbox kickbox-legend';

    // Append a title
    let title = document.createElement('h3');
    title.className = 'kickbox-legend-title';
    title.textContent = this.title;
    this._container.appendChild(title);

    // Create the list UL
    let legend = document.createElement('ul');
    legend.className = 'kickbox-legend-list';

    // Add all item LIs
    for (var i = 0; i < this.breaks.length; i++) {
      var colorBox = document.createElement('div');
      colorBox.className = 'kickbox-legend-color';
      colorBox.style = `background-color: #${this.colors[i]}`;

      var itemText = document.createElement('span');
      itemText.className = 'kickbox-legend-item-text';
      itemText.textContent = this.breaks[i];

      var listItem = document.createElement('li');
      listItem.className = 'kickbox-legend-list-item';

      listItem.appendChild(colorBox);
      listItem.appendChild(itemText);
      legend.appendChild(listItem);
    }

    this._container.appendChild(legend);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

// #endregion Class Declaration

//////////////////////////////
// Module Exports
//////////////////////////////

// #region

export default KickboxCbLegendControl;

// #endregion Module Exports
