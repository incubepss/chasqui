import { ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import {
  latLng,
  Layer,
  polygon,
  tileLayer,
  marker,
  icon,
  LatLngBounds,
  Polygon,
  Marker,
  LatLng,
  GeoJSON,
  Map as LMap,
  FeatureGroup,
} from 'leaflet';
import { FeatureCollection } from 'geojson';
import { ShippingMethod } from './../../../common/generated-types';

const COLORS = ['#179BD3', '#9E57BC', '#F35E44', '#EFC006', '#5AA220'];
let COLOR_POS = 0;

const parseFeature = (entrega: { name: string; description: string }, value: FeatureCollection): Layer[] => {
  const layers = value.features?.map(f => {
    return GeoJSON.geometryToLayer(f, {
      pointToLayer: (geoJsonPoint, { lat, lng }) => {
        return marker(latLng(lat, lng), {
          alt: entrega.name,
          title: entrega.name,
          riseOnHover: true,
          icon: icon({
            iconSize: [25, 41],
            iconAnchor: [13, 41],
            iconUrl: 'assets/marker-icon.png',
            shadowUrl: 'assets/marker-shadow.png',
          }),
        });
      },
    });
  });

  return layers;
};

const chasqui2 = {
  zonasToLayer: (_zonas: ShippingMethod[], onClick: any): Layer[] => {
    COLOR_POS = 0;
    const tmp: any[] = _zonas.map(zona => chasqui2.zonaToPolygon(zona, onClick));
    return tmp.filter(p => !!p);
  },

  zonaToPolygon: (zona: ShippingMethod, onClick: any): Layer | null => {
    if (!zona.customFields?.geolocation) {
      return null;
    }

    let geometry;
    try {
      geometry = JSON.parse(zona.customFields.geolocation);
    } catch (e) {
      return null;
    }

    const isFeature = !!geometry?.type;
    if (isFeature) {
      const layers = parseFeature(zona, geometry);
      const group = new FeatureGroup(layers);
      const str = '<strong>' + zona.name + '</strong> <br /> ' + zona.description;
      group.bindTooltip(str, { direction: 'center' });
      //@ts-ignore
      group.data = zona;
      if (onClick) {
        // @ts-ignore
        group.on('click', onClick);
      }
      return group;
    } else {
      const points = geometry.map((point: any) => latLng(point.x, point.y));
      const pos = COLOR_POS;
      COLOR_POS = (COLOR_POS + 1) % COLORS.length;
      const p = polygon(points, {
        color: COLORS[pos],
      });
      const str = '<strong>' + zona.name + '</strong> <br /> ' + zona.description;
      p.bindTooltip(str, { direction: 'center' });
      if (onClick) {
        // @ts-ignore
        p.data = zona;
        p.on('click', onClick);
      }
      return p;
    }
  },

  puntosToLayers: (puntos: ShippingMethod[], onClick: any): Layer[] => {
    const tmp: any[] = puntos.map(punto => chasqui2.puntoEntregaToMarker(punto, onClick));
    return tmp.filter(mark => !!mark);
  },

  puntoEntregaToMarker: (punto: ShippingMethod, onClick: any): Layer | null => {
    if (!punto.customFields?.geolocation) {
      return null;
    }
    let geometry: any;
    try {
      geometry = JSON.parse(punto.customFields.geolocation);
    } catch (e) {
      return null;
    }

    const isFeature = !!geometry?.type;
    if (isFeature) {
      const layers = parseFeature(punto, geometry);
      const group = new FeatureGroup(layers);
      const str = '<strong>' + punto.name + '</strong> <br /> ' + punto.description;
      group.bindTooltip(str, { direction: 'center' });
      //@ts-ignore
      group.data = punto;
      if (onClick) {
        // @ts-ignore
        group.on('click', onClick);
      }
      return group;
    } else if (Array.isArray(geometry)) {
      const point = geometry;
      const lat = parseFloat(point[0]);
      const lng = parseFloat(point[1]);
      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }
      const m = marker(latLng(lat, lng), {
        alt: punto.name,
        title: punto.name,
        riseOnHover: true,
        icon: icon({
          iconSize: [25, 41],
          iconAnchor: [13, 41],
          iconUrl: 'assets/marker-icon.png',
          shadowUrl: 'assets/marker-shadow.png',
        }),
      });
      const str = '<strong>' + punto.name + '</strong> <br /> ' + punto.description;
      m.bindTooltip(str, { direction: 'bottom' });
      if (onClick) {
        // @ts-ignore
        m.data = punto;
        m.on('click', onClick);
      }
      return m;
    }
    return null;
  },
};

@Component({
  selector: 'vsf-entregas-mapa',
  templateUrl: './entregas-mapa.component.html',
  styleUrls: ['./entregas-mapa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntregasMapaComponent implements OnInit {
  @Input()
  set selectedMethod(method: any) {
    const layer = this._findLayerForMethod(method);
    // buscar El layer del metodo (zona o puntos)
    if (layer) {
      this._showFocusLayer(layer);
    }
  }

  @Output()
  public clickMethod = new EventEmitter<any>();

  options = {
    layers: [tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 })],
    zoom: 5,
    center: latLng(-35.932866, -65.147194),
    attributionControl: false,
  };

  fitBounds: LatLngBounds | undefined = undefined;
  center: LatLng | undefined;
  zoom = 11;

  layers: Layer[] = [];

  constructor(private route: ActivatedRoute, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initShippingMethods();
  }

  _findLayerForMethod(method: ShippingMethod): Layer | undefined {
    if (!method) {
      return;
    }

    // @ts-ignore
    const layer = this.layers.find(l => l.data?.id === method.id);

    return layer;
  }

  initShippingMethods() {
    const shippingMethods = this.route.snapshot.data.shippingMethods;
    const groupByType: Map<string, ShippingMethod[]> = shippingMethods.reduce(
      (groupMap: Map<string, ShippingMethod[]>, method: ShippingMethod) => {
        const type = method.customFields?.typeDelivery || '';
        const value = (groupMap.get(type) || []).concat([method]);
        groupMap.set(type, value);
        return groupMap;
      },
      new Map(),
    );

    const zonasShipping = groupByType.get('shipping') || [];
    const puntosShipping = groupByType.get('showroom') || [];

    const zonasLayers = chasqui2.zonasToLayer(zonasShipping, this.onClick.bind(this));
    const puntosLayers = chasqui2.puntosToLayers(puntosShipping, this.onClick.bind(this));
    this.layers = this.layers.concat(zonasLayers, puntosLayers);

    const group = new FeatureGroup(this.layers);
    this._showFocusLayer(group);
  }

  onClick(e: any) {
    if (e.target.data) {
      this.clickMethod.emit(e.target.data);
      const layer: Layer = e.target;
      this._showFocusLayer(layer);
    }
  }

  _showFocusLayer(layer: Layer) {
    if (!layer) {
      return;
    }

    if ((layer as any).getBounds) {
      this.fitBounds = (layer as any).getBounds();
      this.changeDetector.markForCheck();
    } else if (layer instanceof Polygon) {
      this.fitBounds = layer.getBounds();
      this.changeDetector.markForCheck();
    } else if (layer instanceof Marker) {
      this.fitBounds = undefined;
      this.zoom = 11;
      this.center = layer.getLatLng();
      this.changeDetector.markForCheck();
    }
  }
}
