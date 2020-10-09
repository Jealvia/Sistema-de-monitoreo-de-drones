import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  ViewChild,
} from "@angular/core";
import * as L from "leaflet";
import { IPoint } from "./types";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material/dialog";
import { RutaService } from "app/services/ruta/ruta.service";
import { MatTableDataSource } from "@angular/material/table";
import { IRuta } from "app/services/ruta/type";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import BaseRequest from "app/utils/baseRequest";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-ruta",
  templateUrl: "./ruta.component.html",
  styleUrls: ["./ruta.component.scss"],
})
export class RutaComponent implements OnInit, AfterViewInit {
  // Manejo de rutas con mapa: creacion y actualizacion
  private map;
  public marcadorNumber: number = 0;
  private markers: Array<IPoint> = [];
  private polylines;
  private latlngActual: {
    lat: number;
    lng: number;
  } = {
    lat: 0,
    lng: 0,
  };
  private rutaActual: IRuta = { nombre: "", alias: "", puntos_ruta: [] };
  public alturaGeneral = 0;
  public iconMarkerActive = true;

  // Manejo de tabla de rutas visulizacion de los datos
  displayedColumns: string[] = [
    "nombre",
    "alias",
    "coordenada_inicial",
    "coordenada_final",
    "acciones",
  ];
  dataSource: MatTableDataSource<IRuta>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pagineo: PageEvent = {
    pageIndex: 0,
    pageSize: 10,
    length: 0,
  };
  public showData: boolean = false;
  public rutas: Array<IRuta>;
  public function;

  constructor(
    public dialog: MatDialog,
    private rutaService: RutaService,
    public dialogRef: MatDialogRef<DialogPoint>,
    public dialogRouteRef: MatDialogRef<DialogRoute>,
    private _snackBar: MatSnackBar
  ) {}

  async ngAfterViewInit() {
    await this.getLocation();
    this.initMap();
  }

  ngOnInit(): void {
    navigator.geolocation;
  }

  // Funciones para el manejo de mapa y rutas
  async getLocation() {
    if (navigator.geolocation) {
      await navigator.geolocation.getCurrentPosition((position) => {
        this.latlngActual.lat = position.coords.latitude;
        this.latlngActual.lng = position.coords.longitude;
      });
    }
  }

  private initMap(): void {
    this.map = L.map("map", {
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
    L.DomUtil.addClass(this.map._container, "crosshair-cursor-enabled");
    tiles.addTo(this.map);
  }

  addMarkerToMap(mark: any) {
    this.marcadorNumber++;
    let marcador = L.marker([mark.latlng.lat, mark.latlng.lng], {
      title: "Pos. " + this.marcadorNumber,
      draggable: "true",
    }).addTo(this.map);
    const tmpMarker: IPoint = {
      marker: marcador,
      takeoff: this.alturaGeneral,
    };
    this.markers.push(tmpMarker);

    marcador.on("click", (event) => {
      const dialogRef = this.dialog.open(DialogPoint, {
        width: "40%",
        data: tmpMarker,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result !== undefined && result !== null) {
          if (result.delete) {
            const marker = this.markers.filter((z) => {
              return z.marker._leaflet_id === result.data.marker._leaflet_id;
            });
            this.map.removeLayer(marker[0].marker);
            this.markers = this.markers.filter((z) => {
              return z.marker._leaflet_id !== result.data.marker._leaflet_id;
            });
          } else {
            this.markers.map((z) => {
              if (z.marker._leaflet_id == result.data.marker._leaflet_id) {
                z.takeoff = result.data.takeoff;
              }
            });
          }
          this.createPolyline();
        }
      });
    });
    marcador.on("move", (event) => {
      this.createPolyline();
    });

    this.createPolyline();
  }

  addMarkerToMapDataLoad(mark: any) {
    this.marcadorNumber++;
    let marcador = L.marker([mark.latitud, mark.longitud], {
      title: "Pos. " + this.marcadorNumber,
      draggable: "true",
    }).addTo(this.map);
    const tmpMarker: IPoint = {
      marker: marcador,
      takeoff: mark.altitud,
    };
    this.markers.push(tmpMarker);

    marcador.on("click", (event) => {
      const dialogRef = this.dialog.open(DialogPoint, {
        width: "40%",
        data: tmpMarker,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result !== undefined && result !== null) {
          if (result.delete) {
            const marker = this.markers.filter((z) => {
              return z.marker._leaflet_id === result.data.marker._leaflet_id;
            });
            this.map.removeLayer(marker[0].marker);
            this.markers = this.markers.filter((z) => {
              return z.marker._leaflet_id !== result.data.marker._leaflet_id;
            });
          } else {
            this.markers.map((z) => {
              if (z.marker._leaflet_id == result.data.marker._leaflet_id) {
                z.takeoff = result.data.takeoff;
              }
            });
          }
          this.createPolyline();
        }
      });
    });
    marcador.on("move", (event) => {
      this.createPolyline();
    });

    this.createPolyline();
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

  deleteRoute() {
    this.polylines?.remove();
    this.markers.forEach((z) => z.marker.remove());
    this.markers = [];
    this.marcadorNumber = 0;
  }

  saveRoute() {
    if (!this.rutaActual._id) {
      this.rutaActual.nombre = "";
      this.rutaActual.puntos_ruta = this.markers.map((z) => {
        return {
          altitud: z.takeoff,
          latitud: z.marker._latlng.lat,
          longitud: z.marker._latlng.lng,
        };
      });
    } else {
      this.rutaActual.puntos_ruta = this.markers.map((z) => {
        return {
          altitud: z.takeoff,
          latitud: z.marker._latlng.lat,
          longitud: z.marker._latlng.lng,
        };
      });
    }
    const dialogRef = this.dialog.open(DialogRoute, {
      width: "70%",
      data: this.rutaActual,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.rutaActual = {
          nombre: "",
          alias: "",
          puntos_ruta: [],
          _id: "",
        };
        this.getRoutes();
        this._snackBar.open("Guardado exitosamente.", "OK", {
          duration: 2000,
        });
      }
    });
  }

  resetData() {
    this.markers = [];
    this.alturaGeneral = 0;
    this.iconMarkerActive = true;
  }

  onFileComplete(data: any) {
    const formData = new FormData();
    formData.append("file", data, data.name);
    this.rutaService.loadRutaDocument(formData).subscribe((z) => {
      this.deleteRoute();
      this.marcadorNumber = 0;
      z.forEach((element) => {
        this.addMarkerToMapDataLoad(element);
      });
    });
  }

  onChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append("file", file, file.name);
      /* if(file.type=="application/pdf"){
        this.formRegistro.get('archivo').setValue(file);
      }else{
        this.formRegistro.get('archivo').setValue("");
      } */
    }
  }

  // Funciones para mostrar el listado de rutas
  getRoutes() {
    this.rutaService.getRutas().subscribe((z) => {
      this.rutas = z;
      this.dataSource = new MatTableDataSource(this.rutas);
      this.pagineo.length = z.length;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  async showList(value: boolean) {
    this.showData = value;
    if (!this.showData) {
      await new Promise((r) => setTimeout(r, 1000));
      this.initMap();
    } else {
      this.getRoutes();
      this.resetData();
    }
    
  }

  async editRoute(data?: any) {
    this.showData = false;
    //this.resetData()
    await new Promise((r) => setTimeout(r, 1000));
    this.initMap();
    this.rutaActual = data;
    this.markers = [];
    this.marcadorNumber = 0;
    this.rutaActual.puntos_ruta.forEach((z) => {
      this.marcadorNumber++;
      let marcador = L.marker([z.latitud, z.longitud], {
        title: "Pos. " + this.marcadorNumber,
        draggable: "true",
      }).addTo(this.map);
      const tmpMarker: IPoint = {
        marker: marcador,
        takeoff: z.altitud,
      };
      this.markers.push(tmpMarker);

      marcador.on("click", (event) => {
        const dialogRef = this.dialog.open(DialogPoint, {
          width: "40%",
          data: tmpMarker,
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result !== undefined && result !== null) {
            if (result.delete) {
              const marker = this.markers.filter((z) => {
                return z.marker._leaflet_id === result.data.marker._leaflet_id;
              });
              this.map.removeLayer(marker[0].marker);
              this.markers = this.markers.map((z) => {
                return z.marker._leaflet_id == result.data.marker._leaflet_id
                  ? z
                  : null;
              });
            } else {
              this.markers.map((z) => {
                if (z.marker._leaflet_id == result.data.marker._leaflet_id) {
                  z.takeoff = result.data.takeoff;
                }
              });
            }
            this.createPolyline();
          }
        });
      });
      marcador.on("move", (event) => {
        this.createPolyline();
      });

      this.createPolyline();
    });
    this.map.setView(
      [
        this.rutaActual.puntos_ruta[0].latitud,
        this.rutaActual.puntos_ruta[0].longitud,
      ],
      16
    );
    this.createPolyline();
    this.createPolyline();
    this.createPolyline();
    this.createPolyline();
  }

  //Manejo de clicks
  addMarker() {
    if (this.alturaGeneral <= 0) {
      this._snackBar.open("Ingrese altura válida", "OK", {
        duration: 2000,
      });
    } else {
      this.iconMarkerActive = !this.iconMarkerActive;
      if (!this.iconMarkerActive) {
        this._snackBar.open(
          "Agregar puntos activado, clicke sobre el mapa para crear la ruta.",
          "OK",
          {
            duration: 3000,
          }
        );
        0;
        let that = this;
        this.function = function (e) {
          that.addMarkerToMap(e);
        };
        this.map.on("click", this.function);
      } else {
        this._snackBar.open("Agregar puntos desactivado.", "OK", {
          duration: 3000,
        });
        this.map.off("click", this.function);
      }
    }
  }
}

/* ******************************************************************************************************
  Dialog para el manejo de cada punto
  ******************************************************************************************************/

@Component({
  selector: "dialogPoint",
  templateUrl: "./dialogPoint.html",
  styleUrls: ["./dialog_point.component.scss"],
})
export class DialogPoint {
  pointForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogPoint>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data?: IPoint
  ) {
    this.pointForm = this.formBuilder.group({
      takeoff: ["", Validators.required],
    });
    this.pointForm.setValue({
      takeoff: data.takeoff,
    });
  }

  onNoClick(): void {
    this.dialogRef.close({ data: this.data, delete: false });
  }

  onSubmit() {
    this.data.takeoff = this.pointForm.value.takeoff;
    this.dialogRef.close({ data: this.data, delete: false });
  }

  eliminar() {
    this.dialogRef.close({ data: this.data, delete: true });
  }
}

/* ******************************************************************************************************
  Dialog para el guardado de la ruta
  ******************************************************************************************************/

@Component({
  selector: "dialogRoute",
  templateUrl: "./dialogRoute.html",
  styleUrls: ["./dialog_route.component.scss"],
})
export class DialogRoute {
  rutaForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogRoute>,
    private formBuilder: FormBuilder,
    private rutaService: RutaService,
    @Inject(MAT_DIALOG_DATA) public data?: IRuta
  ) {
    this.rutaForm = this.formBuilder.group({
      nombre: ["", Validators.required],
      alias: ["", Validators.required],
    });
    this.rutaForm.setValue({
      nombre: data.nombre ?? "",
      alias: data.alias ?? "",
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    this.data.nombre = this.rutaForm.value.nombre;
    this.data.alias = this.rutaForm.value.alias;
    const id = this.data._id;
    delete this.data["_id"];
    const tmpData: BaseRequest = new BaseRequest(this.data, id);
    if (id) {
      this.rutaService.updateRuta(tmpData.update()).subscribe((z) => {
        this.dialogRef.close(this.data);
      });
    } else {
      this.rutaService.saveRuta(tmpData.save()).subscribe((z) => {
        this.dialogRef.close(this.data);
      });
    }
  }
}
