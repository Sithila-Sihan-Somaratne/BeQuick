import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faSkype, faViber, faWhatsappSquare, faYahoo } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css'
})
export class PropertiesComponent implements OnInit {

  faSearch = faMagnifyingGlass;
  faWhatsapp = faWhatsappSquare;
  faViber = faViber;
  faPhone = faPhone;
  faSkype = faSkype;
  faMail = faEnvelope;
  faYahoo = faYahoo;

  private defaultZoomLevel: number = 1;

  map!: maplibregl.Map;
  marker!: maplibregl.Marker;
  @ViewChild('propertyLocation')
  propertyLocation!: ElementRef;
  @ViewChild('locationSearch') locationSearch!: ElementRef<HTMLInputElement>;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    // Initialize the map
    this.map = new maplibregl.Map({
      container: 'map', // container ID
      style: 'https://api.maptiler.com/maps/topo-v2/style.json?key=H3popj6B2RgdSd715RTN', // style URL
      center: [0, 0], // starting position [lng, lat]
      zoom: this.defaultZoomLevel // starting zoom
    });

    // Add zoom and rotation controls to the map
    this.map.addControl(new maplibregl.NavigationControl(), "top-right");
  }

  searchLocation(): void {
    if (typeof this.map === 'undefined') {
      this.initializeMap();
    }
    let locationName = this.propertyLocation.nativeElement.textContent;
    fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(locationName)}&apiKey=c3770b9d25254bb183a7d03ea169f51c`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const coordinates = data.features[0]?.properties;
        if (coordinates) {
          this.showMap(coordinates.lon, coordinates.lat);
        } else {
          console.error('No coordinates found for the location:', locationName);
        }
      })
      .catch(error => {
        console.error('Error fetching coordinates:', error);
      });
  }

  showMap(longitude: number, latitude: number): void {
    this.map.flyTo({
      center: [longitude, latitude],
      zoom: 12
    });

    // Add a marker to the map at the searched location
    if (this.marker) {
      this.marker.remove(); // Remove the previous marker if it exists
    }
    // Add a marker to the map at the searched location with the anchor set to 'bottom'
    this.marker = new maplibregl.Marker({ anchor: 'bottom' })
      .setLngLat([longitude, latitude])
      .addTo(this.map);
  }
}
