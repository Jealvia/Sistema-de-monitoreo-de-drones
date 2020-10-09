import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import * as L from "leaflet";
import { RutaService } from "app/services/ruta/ruta.service";
import { IRuta } from "app/services/ruta/type";
import { DronService } from "app/services/dron/dron.service";
import { IDronMision } from "app/services/dron/type";
import { IPoint } from "../ruta/types";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { VueloService } from "app/services/vuelo/vuelo.service";
import { IDronConexion, Mision } from "app/services/vuelo/type";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { MisionData } from "./vuelo";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
@Component({
  selector: "app-vuelo",
  templateUrl: "./vuelo.component.html",
  styleUrls: ["./vuelo.component.scss"],
})
export class VueloComponent implements OnInit, AfterViewInit {
  private map;
  public misionForm: boolean = false;
  public rutas: Array<IRuta>;
  public checked = false;
  public rutasSeleccionadas: Array<any> = [];
  private markers: Array<IPoint> = [];
  public dronesActivos: Array<IDronConexion> = [];
  private polylines;
  public historial: boolean = false;
  public sendMision: boolean = false;
  public intervalMisiones: any;
  public intervalMisionesActivas: any;
  public marcadorGeneral: IPoint;
  public dronIcon = L.icon({
    iconUrl: "../../../assets/drone.png",

    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
    popupAnchor: [0, 0], // point from which the popup should open relative to the iconAnchor
  });
  public misionPrueba: Mision;
  public misionesActivas: Array<Mision> = [];
  public seeMision: boolean = true; // Para controlar el boton de iniciar mision
  public marcadorDronesMisionActivas: Array<IPoint> = [];
  public mostrarVuelo: boolean = false;
  //Formulario
  public route: any;
  //Tablas
  public historialMisiones: Array<MisionData> = [];
  displayedColumns: string[] = [
    "nombre",
    "fecha",
    "hora_inicio",
    "hora_fin",
    "dron",
  ];
  dataSource: MatTableDataSource<MisionData>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pagineo: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
  };

  constructor(
    private rutaService: RutaService,
    private vueloService: VueloService,
    private dronService: DronService,
    public dialogRef: MatDialogRef<SendMisionDialog>,
    public dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
    //this.sowRutas();
  }

  ngOnInit() {
    this.getRoutes();
    this.getMisionesActivas(5000);
  }

  ngDoCheck() {
    this.sendMision = this.dronesActivos?.find((z) => z.selected)
      ? true
      : false;
    this.seeMision = this.misionesActivas.length > 0 ? false : true;
  }

  obtenerMisiones() {
    this.vueloService.getListadoMisiones().subscribe((z) => {
      this.historialMisiones = z.reverse();
      this.dataSource = new MatTableDataSource(this.historialMisiones);
      this.pagineo.length = z.length;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  refreshData() {
    this.intervalMisiones = setInterval(() => {
      this.vueloService.getMisiones().subscribe((z) => {
        if (z.length != this.dronesActivos.length) {
          if (z.length > this.dronesActivos.length) {
            const ids = this.dronesActivos.map((z) => {
              return z.dron.id;
            });
            const drones = z.filter((a) => {
              const result = !ids.includes(a.dron.id);
              return result;
            });
            drones.map((z) => (z.routes = this.rutas));
            this.dronesActivos = this.dronesActivos.concat(drones);
          } else {
            const ids = z.map((z) => {
              return z.dron.id;
            });
            this.dronesActivos = this.dronesActivos.filter((a) => {
              const result = ids.includes(a.dron.id);
              return result;
            });
          }
        }
      });
    }, 5000);
  }

  mostrarVueloDronMapa(mision: Mision) {
    const lastMisionPoint = mision.datos_list.length - 1;
    const z = mision.datos_list[lastMisionPoint];
    if (z) {
      const indice = this.marcadorDronesMisionActivas.findIndex(
        (a) => a.dron_id == z.dron.id
      );
      if (indice != -1) {
        this.marcadorDronesMisionActivas[indice].marker
          .setLatLng([
            z.position.ubicacion_actual.latitud,
            z.position.ubicacion_actual.longitud,
          ])
          .update(); //.remove();
        this.marcadorDronesMisionActivas[
          indice
        ].marker.bindPopup(
          "<div class='container' style='width: 200px;'><div class='row'><div class='col'>Nº serie: " +
            z.dron.numero_serie +
            "</div></div><div class='row'><div class='col'>Pitch: " +
            Number(z.position.rotaciones.x).toFixed(2) +
            "- Yaw: " +
            Number(z.position.rotaciones.y).toFixed(2) +
            "- Roll: " +
            Number(z.position.rotaciones.z).toFixed(2) +
            "</div></div><div class='row'><div class='col'>Lat-Lng: (" +
            z.position.ubicacion_actual.latitud.toFixed(3) +
            "," +
            z.position.ubicacion_actual.longitud.toFixed(3) +
            ")</div></div><div class='row'><div class='col'>Alt: " +
            z.position.ubicacion_actual.altitud.toFixed(3) +
            " Bateria: " +
            z.position.bateria_residua +
            "%</div></div><div class='row'><div class='col'>Velocidad x: " +
            z.position.velocidad[0] +
            " m/s </div></div><div class='row'><div class='col'>Velocidad y: " +
            z.position.velocidad[1] +
            " m/s </div></div><div class='row'><div class='col'>Velocidad z: " +
            z.position.velocidad[2] +
            " m/s </div></div></div></div>",
          { maxWidth: 700 }
        );
        this.marcadorDronesMisionActivas[indice].takeoff =
          z.position.ubicacion_actual.altitud;
        this.marcadorDronesMisionActivas[indice].dron_id = z.dron.id;
        this.marcadorDronesMisionActivas[indice].data_punto = z;
      } else {
        let marcador = L.marker(
          [
            z.position.ubicacion_actual.latitud,
            z.position.ubicacion_actual.longitud,
          ],
          { icon: this.dronIcon },
          {
            title: "Pos. ",
            draggable: false,
          }
        );
        marcador.bindPopup(
          "<div class='container' style='width: 200px;'><div class='row'><div class='col'>Nº serie: " +
            z.dron.numero_serie +
            "</div></div><div class='row'><div class='col'>Pitch: " +
            Number(z.position.rotaciones.x).toFixed(2) +
            "- Yaw: " +
            Number(z.position.rotaciones.y).toFixed(2) +
            "- Roll: " +
            Number(z.position.rotaciones.z).toFixed(2) +
            "</div></div><div class='row'><div class='col'>Lat-Lng: (" +
            z.position.ubicacion_actual.latitud.toFixed(3) +
            "," +
            z.position.ubicacion_actual.longitud.toFixed(3) +
            ")</div></div><div class='row'><div class='col'>Alt: " +
            z.position.ubicacion_actual.altitud.toFixed(3) +
            " Bateria: " +
            z.position.bateria_residua +
            "%</div></div><div class='row'><div class='col'>Velocidad x: " +
            z.position.velocidad[0] +
            " m/s </div></div><div class='row'><div class='col'>Velocidad y: " +
            z.position.velocidad[1] +
            " m/s </div></div><div class='row'><div class='col'>Velocidad z: " +
            z.position.velocidad[2] +
            " m/s </div></div></div></div>",
          { maxWidth: 700 }
        );
        marcador.addTo(this.map);
        marcador.openPopup();
        const tmpMarker: IPoint = {
          marker: marcador,
          takeoff: z.position.ubicacion_actual.altitud,
          dron_id: z.dron.id,
          data_punto: z,
        };
        this.marcadorDronesMisionActivas.push(tmpMarker);
      }
    }
  }

  private initMap(): void {
    this.map = L.map("map2", {
      center: [-2.193802, -79.89176],
      zoom: 12,
    });
    const tiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );

    tiles.addTo(this.map);
  }

  mostrarDronesDisponibles() {
    this.seeMision = true;
    this.cleanMap();
    this.misionForm = false;
    this.mostrarVuelo = false;
    clearInterval(this.intervalMisionesActivas);
    this.refreshData();
    this.getMisionesActivas(5000);
    this.marcadorDronesMisionActivas=[]
  }

  verMision() {
    this.cleanMap();
    this.seeMision = false;
    clearInterval(this.intervalMisiones);
    this.mostrarVuelo = true;
    this.getMisionesActivas(0);
    this.misionForm = true;
    // clearInterval(this.intervalMisionesActivas);
  }

  getMisionesActivas(time: number) {
    if (this.intervalMisionesActivas) {
      clearInterval(this.intervalMisionesActivas);
    }
    this.intervalMisionesActivas = setInterval(() => {
      this.vueloService.getMisionesActivas().subscribe((z) => {
        this.misionesActivas = z;
        if (this.mostrarVuelo) {
          this.misionesActivas.forEach((x) => {
            this.mostrarVueloDronMapa(x);
          });
          if (this.misionesActivas.length == 0) {
            clearInterval(this.intervalMisionesActivas);
          }
        }
      });
    }, time);
  }

  crearMision() {
    const dialogRef = this.dialog.open(SendMisionDialog, {
      width: "40%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined && result !== null) {
        this.dronesActivos.forEach((z) => {
          if (z.selected) {
            this.vueloService
              .crearMision({
                dron_id: z.dron.id,
                ruta_id: z.route,
                nombre: result.nombre,
              })
              .subscribe((z) => {
                console.log(z);
              });
          }
        });
      }
    });
  }

  getRoutes() {
    this.rutaService.getRutas().subscribe((z) => {
      this.rutas = z;
      this.vueloService.getMisiones().subscribe((z) => {
        this.dronesActivos = z;
        this.dronesActivos.map((z) => (z.routes = this.rutas));
        this.refreshData();
      });
    });
  }

  routeSelected(dron: IDronMision) {
    if (this.rutasSeleccionadas.find((z) => z.dron_id === dron._id)) {
      this.rutasSeleccionadas.map((z) => {
        if (z.dron_id === dron._id) {
          z.ruta_selected = dron.route;
        }
      });
    } else {
      this.rutasSeleccionadas.push({
        dron_id: dron._id,
        ruta_selected: dron.route,
      });
    }
    this.dronesActivos.map((z) => {
      const tmp_rutas = this.rutasSeleccionadas
        .filter((a) => a.dron_id !== z._id)
        .map((z) => z.ruta_selected);
      z.routes = this.rutas.filter((a) => !tmp_rutas.includes(a._id));
    });
  }

  seeRoute(dron: IDronMision) {
    this.deleteRoute();
    this.markers = [];
    let marcadorNumber = 0;
    const ruta = this.rutas.find((z) => z._id === dron.route);
    ruta.puntos_ruta.forEach((z) => {
      marcadorNumber++;
      let marcador = L.marker([z.latitud, z.longitud], {
        title: "Pos. " + marcadorNumber,
        draggable: false,
      }).addTo(this.map);
      const tmpMarker: IPoint = {
        marker: marcador,
        takeoff: z.altitud,
      };
      this.markers.push(tmpMarker);
      this.createPolyline();
    });
    this.map.setView(
      [ruta.puntos_ruta[0].latitud, ruta.puntos_ruta[0].longitud],
      16
    );
  }

  async createPolyline() {
    if (this.markers.length > 1) {
      this.polylines?.remove();
      const latlngs = [];
      this.markers.forEach((z) => {
        latlngs.push([z.marker._latlng.lat, z.marker._latlng.lng]);
      });
      this.polylines = L.polyline(latlngs, { color: "red" });
      this.polylines.addTo(this.map);
    }
  }

  public cleanMap() {
    this.polylines?.remove();
    this.markers.forEach((z) => z.marker.remove());
    this.marcadorDronesMisionActivas.forEach(z=>{
      z.marker?.remove();
    })
  }

  deleteRoute() {
    this.polylines?.remove();
    this.markers.forEach((z) => z.marker.remove());
    this.markers = [];
  }

  history() {
    this.historial = true;
    clearInterval(this.intervalMisiones);
    clearInterval(this.intervalMisionesActivas);
    this.obtenerMisiones();
  }

  async createMision() {
    this.historial = false;
    await new Promise((r) => setTimeout(r, 1000));
    this.initMap();
    clearInterval(this.intervalMisiones);
    clearInterval(this.intervalMisionesActivas);
    this.cleanMap();
    this.refreshData();
    this.getMisionesActivas(5000);
  }
}

@Component({
  selector: "send-mission-dialog",
  templateUrl: "send-mission-dialog.html",
  styleUrls: ["./send-mission-dialog.component.scss"],
})
export class SendMisionDialog {
  misionForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<SendMisionDialog>,
    private formBuilder: FormBuilder
  ) {
    this.misionForm = this.formBuilder.group({
      nombre: ["", Validators.required],
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  aceptar() {
    this.dialogRef.close({ nombre: this.misionForm.value.nombre });
  }
}
