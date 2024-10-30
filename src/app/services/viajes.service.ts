import { Injectable } from '@angular/core';
import { Viajes } from '../interfaces/viajes';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ViajesService {

  private viajesCollection = this.firestore.collection<Viajes>('viajes');

  constructor(private firestore: AngularFirestore) {}

  // Crear un nuevo viaje
  crearViaje(viaje: Viajes): Observable<any> {
    return new Observable((observer) => {
      this.viajesCollection.add(viaje)
        .then((docRef) => {
          observer.next(docRef.id); // Enviar el ID del documento al suscriptor
          observer.complete(); // Completar el observable
        })
        .catch((error) => {
          observer.error(error); // Manejar cualquier error
        });
    });
  }

  // Obtener un viaje por código
  obtenerViajePorCodigo(codigo: string): Observable<Viajes | undefined> {
    return this.viajesCollection.doc<Viajes>(codigo).valueChanges();
  }

  // Actualizar un viaje
  actualizarViaje(codigo: string, viaje: Partial<Viajes>): Promise<void> {
    return this.viajesCollection.doc(codigo).update(viaje);
  }

  // Eliminar un viaje
  eliminarViaje(codigo: string): Promise<void> {
    return this.viajesCollection.doc(codigo).delete();
  }

  // Generar un código único
  generarCodigoUnico(): string {
    return this.firestore.createId();
  }
  
}
