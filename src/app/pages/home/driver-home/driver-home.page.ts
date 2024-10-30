import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Usuario } from 'src/app/interfaces/usuario';
import { Viajes } from 'src/app/interfaces/viajes';
import { ViajesService } from 'src/app/services/viajes.service';

declare var google: any;

@Component({
  selector: 'app-driver-home',
  templateUrl: './driver-home.page.html',
  styleUrls: ['./driver-home.page.scss'],
})

export class DriverPage implements OnInit, AfterViewInit {

  /* ----- MAPA ----- */

  map: any;
  directionsService: any;
  directionsRenderer: any;

  /*----UBICACION-------*/

  codigoViaje: string = '';
  ubicacionInicio: string | null = null;
  ubicacionDestino: string | null = null;

  /* ------ USUARIO ------ */

  usuarioLogin?: string;
  usuarios: Usuario[] = [];

  public nombreUsuario?: string;
  public apellidoUsuario?: string;
  public img_usuario?: string;
  
  ubicaciones = [
    { lat: -33.598425578019224, lng: -70.57833859675443, icon: 'assets/icon/instituto.png', label: 'Cede Puente Alto', value: 'puente_alto' },
    { lat: -33.66860553928277, lng: -70.58535175998844, icon: 'assets/icon/instituto.png', label: 'Cede Pirque', value: 'pirque' },
    { lat: -33.5800609330941, lng: -70.58197464104566, icon: 'assets/icon/stop.png', label: 'TL-1 / Av. Gabriela & Av. Concha y Toro', value: 'tl1' },
    { lat: -33.57426112502435, lng: -70.55495967884225, icon: 'assets/icon/stop.png', label: 'TL-2 / Av. Gabriela Ote. & Av. Camilo Henriquez', value: 'tl2' },
    { lat: -33.56692284768454, lng: -70.63052933119687, icon: 'assets/icon/stop.png', label: 'TL-3 / Av. Observatorio & Av. Sta. Rosa', value: 'tl3' },
  ];

  qrData: string = '';
  qrViaje: string = '';

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private viajesService: ViajesService) { }

  ngAfterViewInit(){}

  ngOnInit() {
    this.usuarioLogin = localStorage.getItem('usuarioLogin') || '';

    // Recupera nombre y apellido del localStorage
    this.nombreUsuario = localStorage.getItem('nombreUsuario') || 'Desconocido';
    this.apellidoUsuario = localStorage.getItem('apellidoUsuario') || '';
    
    this.config();
    this.loadGoogleMaps().then(() => {
      this.initMap();
    });
  }  

  /* ----- Subscripción a la COLECCION DE USUARIOS -----*/

  config() {
    this.firestore.collection('usuarios').valueChanges().subscribe((usuarios: any[]) => {
      this.usuarios = usuarios;
      const usuarioEncontrado = this.usuarios.find((usuario) => usuario.email === this.usuarioLogin);
      if (usuarioEncontrado) {
        this.nombreUsuario = usuarioEncontrado.nombre;
        this.apellidoUsuario = usuarioEncontrado.apellido;
        this.img_usuario = usuarioEncontrado.img_usuario;
      }
    });
  }

  /* ----- INICIALIZAR MAPA ----- */

  async initMap() {
    const mapOptions = {
      center: { lat: -33.59841000351409, lng: -70.57834513910244 },
      zoom: 13,
      disableDefaultUI: true,
      styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }, { featureType: "road", stylers: [{ visibility: "on" }] }],
    };
  
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true, polylineOptions: { strokeColor: '#242424', strokeWeight: 8 } });
    this.directionsRenderer.setMap(this.map);
  
    const position = await Geolocation.getCurrentPosition();
    const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
  
    this.addMarker(pos, 'Your location', 'assets/icon/ubi.png');
  
    this.ubicaciones.forEach((ubicacion) => {
      this.addMarker({ lat: ubicacion.lat, lng: ubicacion.lng }, ubicacion.label, ubicacion.icon);
    });
  }
  
  addMarker(position: { lat: number; lng: number }, title: string, iconUrl: string) {
    new google.maps.Marker({
      position,
      map: this.map,
      title,
      icon: { url: iconUrl, scaledSize: new google.maps.Size(40, 40) },
    });
  }  

  loadGoogleMaps(): Promise<any> {
    return new Promise((resolve) => {
      if (typeof google !== 'undefined') {
        resolve(true);
      } else {
        window['googleMapsCallback'] = () => resolve(true);
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAp4tplN5KEmKIHOV4vyFXuS6KKFsJqESg&callback=googleMapsCallback';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    });
  }

  onInicioChange() {
    if (this.ubicacionDestino === this.ubicacionInicio) {
      this.ubicacionDestino = null;
    }
  }
  
  async startTrip() {
    const inicio = this.ubicaciones.find((ubicacion) => ubicacion.value === this.ubicacionInicio);
    const destino = this.ubicaciones.find((ubicacion) => ubicacion.value === this.ubicacionDestino);
    
    if (inicio && destino) {
      const currentPosition = await Geolocation.getCurrentPosition();
      const pos = { lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude };
  
      const codigoViaje = this.viajesService.generarCodigoUnico();

      const driverName = `${this.nombreUsuario || 'Desconocido'} ${this.apellidoUsuario || ''}`.trim();
  
      const viaje: Viajes = {
        codigo: codigoViaje,
        nom_inicio: inicio.label || '',
        nom_destino: destino.label || '',
        inicio: `${pos.lat},${pos.lng}`, 
        fecha: new Date().toISOString(),
        coordenada: `${pos.lat},${pos.lng}`, 
        coordenada_destino: `${destino.lat},${destino.lng}`,
        driverName: driverName 
      };      
  
      this.viajesService.crearViaje(viaje).subscribe({
        next: (docId) => {
          console.log('Viaje creado con ID:', docId);
          this.codigoViaje = codigoViaje;
          this.qrViaje = codigoViaje;
          this.qrData = this.qrViaje;
        },
        error: (error) => {
          console.error('Error al crear viaje:', error);
        }
      });
  
      // Configurar y dibujar la ruta (opcional)
      this.directionsRenderer.setMap(null); // Limpiar rutas anteriores
      const directionsRequest: google.maps.DirectionsRequest = {
        origin: pos,
        destination: { lat: destino.lat, lng: destino.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      };
  
      this.directionsService.route(directionsRequest, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer.setDirections(result);
          this.directionsRenderer.setMap(this.map);
        } else {
          console.error('Error fetching directions', result);
        }
      });
    } else {
      console.log('Please select both start and destination locations.');
    }
  }
  

  getOpcionesDestino() {
    return this.ubicaciones.filter(ubicacion => ubicacion.value !== this.ubicacionInicio);
  }

  goToConfig() {
    this.router.navigate(['/user-home/config-page']);
  }

}
