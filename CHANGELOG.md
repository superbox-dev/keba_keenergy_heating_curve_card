# Änderungen

## 1.1.0

- Sichtbaren Temperaturbereich und Rasterweite für X- und Y-Achse im visuellen
  Karteneditor oder per YAML einstellen. Die Karteneinstellungen ändern nur das Diagramm.
- Beide Achsen verwenden weiterhin automatische Grenzen und ein 5-°C-Raster,
  wenn keine Achseneinstellungen angegeben sind.

## 1.0.2

- Deutsch und Englisch für Karte, Editor, Meldungen, Kennwortdialog und Diagramm.
- Automatische Auswahl anhand der HA-Profilsprache; optional `language: de`/`en`.
- Englischer Ersatz für weitere HA-Sprachen; HA-Zahlenformat wird berücksichtigt.
- Eigene Namen, Titel und technische Kennungen bleiben unverändert.

## 1.0.1

- Seitensprung beim Hinzufügen und Entfernen von Kurvenpunkten behoben: Karte,
  Schaltflächen und Scrollbereich bleiben bestehen; nur Punktzeilen und Vorschau
  werden aktualisiert.
- Auch bei gleichzeitig ungespeicherten Heizgrenzen bleibt die Ansicht erhalten.
- Maus-/Tastaturbedienung und die Grenze von 16 Punkten geprüft.

## 1.0.0

- Allgemeine Karte mit Regler-/Heizkreiserkennung, Kurventabellen,
  Punktebearbeitung, Heizgrenzen und optionalem eigenem Kennwort.
