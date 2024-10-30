import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Usuario } from 'src/app/interfaces/usuario';
import { Viajes } from 'src/app/interfaces/viajes';
import { ViajesService } from 'src/app/services/viejes.service';

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

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
    private viajesService: ViajesService) { }

  ngAfterViewInit(){}

  ngOnInit() {
    this.usuarioLogin = localStorage.getItem('usuarioLogin') || '';
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

    new google.maps.Marker({
      position: pos,
      map: this.map,
      title: "Your location",
      icon: { url: 'assets/icon/ubi.png', scaledSize: new google.maps.Size(50, 50) },
    });

    this.map.setCenter(pos);

    this.ubicaciones.forEach((ubicacion) => {
      const marker = new google.maps.Marker({
        position: { lat: ubicacion.lat, lng: ubicacion.lng },
        map: this.map,
        icon: { url: ubicacion.icon, scaledSize: new google.maps.Size(40, 40) },
        title: ubicacion.label,
      });

      const infoWindow = new google.maps.InfoWindow({ content: `<p>${ubicacion.label}</p>` });
      marker.addListener('click', () => infoWindow.open(this.map, marker));
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#242424',
        strokeWeight: 5,       
      },
    });
  
    this.directionsRenderer.setMap(this.map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
              };
  
              new google.maps.Marker({
                  position: pos,
                  map: this.map,
                  title: "Tu ubicación actual",
                  icon: {
                      url: 'assets/icon/ubi.png',
                      scaledSize: new google.maps.Size(50, 50),
                  },
              });
  
              this.map.setCenter(pos);
          },
          () => {
              handleLocationError(true, this.map.getCenter());
          }
      );
  } else {
      handleLocationError(false, this.map.getCenter());
  }

    function handleLocationError(browserHasGeolocation: boolean, pos: any) {
      alert(browserHasGeolocation
          ? "Error: El servicio de geolocalización ha fallado."
          : "Error: Tu navegador no soporta la geolocalización.");
    }

    this.ubicaciones.forEach((ubicacion) => {
      const marker = new google.maps.Marker({
        position: { lat: ubicacion.lat, lng: ubicacion.lng },
        map: this.map,
        icon: {
          url: ubicacion.icon,
          scaledSize: new google.maps.Size(40, 40),
        },
        title: ubicacion.label,
      });
  
      const infoWindow = new google.maps.InfoWindow({
        content: `<p>${ubicacion.label}</p>`,
      });
  
      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });
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

  getOpcionesDestino() {
    return this.ubicaciones.filter(ubicacion => ubicacion.value !== this.ubicacionInicio);
  }

  goToConfig() {
    this.router.navigate(['/user-home/config-page']);
  }

}
