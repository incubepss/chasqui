/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Dialog } from '@vendure/admin-ui/core';
import L, {
  featureGroup,
  FeatureGroup,
  latLng,
  tileLayer,
  Layer,
  marker,
  Marker,
  GeoJSON,
  polygon,
  LatLngBounds,
  LatLng,
  latLngBounds,
} from 'leaflet';
import { FeatureCollection } from 'geojson';
import drawLocales from 'leaflet-draw-locales';

import { ResponsePoint } from './../../services/GeolocationService';

drawLocales('es');

@Component({
  selector: 'chq-geolocation-dialog',
  templateUrl: './geolocation.dialog.html',
  styleUrls: ['./geolocation.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeolocationDialog implements Dialog<{ mode: 'point' | 'zone'; value: any }>, OnInit {
  mode: 'point' | 'zone' = 'point';
  resolveWith: (result?: any) => void;
  map: L.Map;

  options = {
    layers: [tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 })],
    zoom: 5,
    center: latLng(-35.932866, -65.147194),
  } as any;

  fitBounds: LatLngBounds | undefined = undefined;
  center: LatLng | undefined;
  zoom = 11;

  drawnItems: FeatureGroup = featureGroup();

  drawOptions = {
    draw: {
      polyline: false,
      rectangle: false,
      circlemarker: false,
      circle: false,
      polygon: true,
      marker: true,
    },
    edit: {
      featureGroup: this.drawnItems,
    },
  };

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    const isModePoint = this.mode === 'point';
    this.drawOptions.draw = {
      ...this.drawOptions.draw,
      polygon: !isModePoint,
      marker: isModePoint,
    };
    // @ts-ignore
    this._parseInitialValue(this.value);
  }

  onSelectGeoPoint(point: ResponsePoint) {
    if (!point) {
      return;
    }

    const bounding = point.boundingbox;

    if (bounding && bounding.length >= 4) {
      const bound = latLngBounds(
        latLng(parseFloat(bounding[0]), parseFloat(bounding[2])),
        latLng(parseFloat(bounding[1]), parseFloat(bounding[3])),
      );
      this.fitBounds = bound;
    }

    if (point.class === 'place') {
      const mark = marker(latLng(parseFloat(point.lat), parseFloat(point.lon)));
      this.drawnItems.addLayer(mark);
    }
  }

  _parseInitialValue(valueStr: string): any {
    try {
      const value = JSON.parse(valueStr);
      const isPoint = value?.length === 2;
      const isFeature = !!value?.type;
      const isLegacyData = !!value?.[0]?.x;

      let parserFunction: any = () => null;

      if (isLegacyData) {
        parserFunction = this._parseLegacyData;
      } else if (isFeature) {
        parserFunction = this._parseFeature;
      } else if (isPoint) {
        parserFunction = this._parseInitalPoint;
      }

      const layer = parserFunction(value);
      if (!layer) {
        return;
      }

      if (layer instanceof Marker) {
        const ll = (layer as Marker).getLatLng();
        this.center = ll;
      }

      if (layer instanceof Layer) {
        this.drawnItems.addLayer(layer);
      } else if (Array.isArray(layer)) {
        layer.map(l => this.drawnItems.addLayer(l));
      }

      this._showFocusLayer();
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  _parseFeature(value: FeatureCollection): Layer[] {
    const layers = value.features?.map(f => {
      return GeoJSON.geometryToLayer(f);
    });

    return layers;
  }

  _parseInitalPoint(point: any[]): Layer | null {
    if (point?.length !== 2) {
      return null;
    }
    const lat = parseFloat(point[0]);
    const lng = parseFloat(point[1]);
    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }

    const p = latLng(lat, lng);

    return marker(p);
  }

  _parseLegacyData(geometry: any[]): Layer | null {
    const points = geometry.map((point: any) => latLng(point.x, point.y));
    const l = polygon(points);
    return l;
  }

  _showFocusLayer() {
    try {
      const bounds = this.drawnItems.getBounds();
      const center = bounds.getCenter();
      this.center = center;
      this.zoom = 12;
      this.changeDetector.markForCheck();
    } catch (e) {
      console.error(e);
    }
  }

  onMapReady(map: L.Map) {
    this.map = map;
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }

  public onDrawCreated(e: any) {
    this.drawnItems.addLayer(e.layer);
  }

  okay() {
    const result: any = this.drawnItems.toGeoJSON();

    if (result.type === 'FeatureCollection' && result.features.length === 0) {
      this.resolveWith('');
      return;
    }

    this.resolveWith(JSON.stringify(result));
  }

  cancel() {
    this.resolveWith(false);
  }
}
