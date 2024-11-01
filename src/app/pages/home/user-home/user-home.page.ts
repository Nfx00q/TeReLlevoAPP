
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Usuario } from 'src/app/interfaces/usuario';
import { Geolocation } from '@capacitor/geolocation';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import Swal from 'sweetalert2';
import { Viajes } from 'src/app/interfaces/viajes';


declare var google: any;

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.page.html',
  styleUrls: ['./user-home.page.scss'],
})

export class UserHomePage implements OnInit {
  
  usuarios: Usuario[] = [];
  public nombreUsuario?: string;
  public apellidoUsuario?: string;
  public img_usuario?: string;
  usuarioLogin?: string;

  map: any;
  directionsService: any;
  directionsRenderer: any;

  ubicacionInicio: string | null = null;
  ubicacionDestino: string | null = null;

  /* SCANNER QR */

  viajeData: any;

  ubicaciones = [
    { lat: -33.598425578019224, lng: -70.57833859675443, icon: 'assets/icon/instituto.png', label: 'Cede Puente Alto', value: 'puente_alto' },
    { lat: -33.66860553928277, lng: -70.58535175998844, icon: 'assets/icon/instituto.png', label: 'Cede Pirque', value: 'pirque' },
    { lat: -33.5800609330941, lng: -70.58197464104566, icon: 'assets/icon/stop.png', label: 'TL-1 / Av. Gabriela & Av. Concha y Toro', value: 'tl1' },
    { lat: -33.57426112502435, lng: -70.55495967884225, icon: 'assets/icon/stop.png', label: 'TL-2 / Av. Gabriela Ote. & Av. Camilo Henriquez', value: 'tl2' },
    { lat: -33.56692284768454, lng: -70.63052933119687, icon: 'assets/icon/stop.png', label: 'TL-3 / Av. Observatorio & Av. Sta. Rosa', value: 'tl3' },
  ];

  constructor(
    private firestore: AngularFirestore, 
    private router: Router,
    private BarcodeScanner: BarcodeScanner
  ) { }

  ngOnInit() {
    this.usuarioLogin = localStorage.getItem('usuarioLogin') || '';
    this.config();
    this.loadGoogleMaps().then(() => {
      this.initMap();
    });
  }

  /* ----- CARGA DE USERS ----- */

  async cargarUsuarios() {
    try {
      const usuariosSnapshot = await this.firestore.collection<Usuario>('usuarios', ref => ref.where('activo', '==', true)).get().toPromise();
      this.usuarios = usuariosSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Usuario[];
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  /* ----- SCANEO QR ----- */

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

  onInicioChange() {
    if (this.ubicacionDestino === this.ubicacionInicio) {
      this.ubicacionDestino = null;
    }
  }

  getOpcionesDestino() {
    return this.ubicaciones.filter(ubicacion => ubicacion.value !== this.ubicacionInicio);
  }

  displayRoute(viajeData: any) {
    const { inicio, final } = viajeData;

    if (!inicio || !final) {
        console.error('Faltan datos de inicio o final en viajeData');
        return; // Salir si faltan datos
    }

    // Convertir las coordenadas a números si es necesario
    const [latInicio, lngInicio] = inicio.split(',').map(Number);
    const [latFinal, lngFinal] = final.split(',').map(Number);

    const directionsRequest: google.maps.DirectionsRequest = {
        origin: { lat: latInicio, lng: lngInicio },
        destination: { lat: latFinal, lng: lngFinal },
        travelMode: google.maps.TravelMode.DRIVING,
    };

    this.directionsService.route(directionsRequest, (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
            this.directionsRenderer.setDirections(result);
            this.directionsRenderer.setMap(this.map);
        } else {
            console.error('Error al obtener las direcciones', result);
        }
    });
  }

  goToConfig() {
    this.router.navigate(['/config-page']);
  }

  /* -------- SCANNER DE QR -------- */

  async scanQr() {
    if (this.isCordovaAvailable()) {
      try {
        const barcodeData = await this.BarcodeScanner.scan();
        console.log('Código QR escaneado', barcodeData.text);
        
        // Buscar el viaje en Firestore
        this.fetchViaje(barcodeData.text);
      } catch (err) {
        console.error('Error al escanear QR', err);
      }
    } else {
      console.warn('Cordova no está disponible. Simulando escaneo de QR...');
      this.simulateQrScan();
    }
  }

  private isCordovaAvailable(): boolean {
    return !!window.cordova; // Verifica si Cordova está disponible
  }

  private simulateQrScan() {
    // Simula un código QR escaneado
    const simulatedData = { text: 'ID_DEL_VIAJE_SIMULADO' };
    console.log('Código QR simulado', simulatedData.text);
    this.fetchViaje(simulatedData.text); // Usar el ID simulado para buscar el viaje
  }

  private fetchViaje(codigo: string) {
    const viajeRef = this.firestore.collection<Viajes>('Viajes', ref => ref.where('codigo', '==', codigo));
    
    viajeRef.get().subscribe(snapshot => {
      if (snapshot.empty) {
        console.log('No se encontró el viaje');
        this.viajeData = null; // Si no hay viaje, restablece la variable
      } else {
        snapshot.forEach(doc => {
          this.viajeData = doc.data() as Viajes; // Asigna los datos del viaje a la variable
          console.log('Viaje encontrado:', this.viajeData);
        });
      }
    }, error => {
      console.error('Error al obtener el viaje', error);
    });
  }
  
}