import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { finalize, Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(
    private angularFireAuth : AngularFireAuth, 
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ){}

  getUsers(): Observable<any[]> {
    return this.firestore.collection('usuarios').valueChanges();
  }

  getUserData(uid: string): Observable<any> {
    return this.firestore.collection('usuarios').doc(uid).valueChanges();
  }

  getCurrentUser() {
    return this.angularFireAuth.authState;
  }

  async editUser(usuarioId: string, updatedData?: any) {
    await this.firestore.collection('usuarios').doc(usuarioId).update(updatedData);
  }

  deleteUser(uid: string) {
    return this.firestore.collection('usuarios').doc(uid).update({ disabled: true });
  }

  login(email: string, pass: string) {
    return this.angularFireAuth.signInWithEmailAndPassword(email, pass);
  }

  register(email: string, pass: string){
    return this.angularFireAuth.createUserWithEmailAndPassword(email, pass);
  }

  async logOut() {
    await this.angularFireAuth.signOut();  // Asegúrate de cerrar sesión en el servicio de autenticación.
    localStorage.removeItem('usuarioLogin');  // Elimina el usuario almacenado en localStorage.
  }
  
  async resetPassword(email: string) {
    if (!email) {
      throw new Error('El correo electrónico es obligatorio');
    }
    try {
      await this.angularFireAuth.sendPasswordResetEmail(email);
    } catch (error: any) { // Usa 'any' para evitar el error
      throw new Error(`Error al enviar el correo de recuperación: ${error.message}`);
    }
  }

  async uploadImageToFirebase(file: File, userId: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const filePath = `user_images/${userId}/${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, file);

      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(
            (url) => resolve(url),
            (error) => reject(error)
          );
        })
      ).subscribe();
    });
  }
  
}
