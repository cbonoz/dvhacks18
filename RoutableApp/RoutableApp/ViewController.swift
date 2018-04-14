//
//  ViewController.swift
//  RoutableApp
//
//  Created by Edward Arenberg on 4/13/18.
//  Copyright © 2018 Edward Arenberg. All rights reserved.
//

import UIKit
import AVFoundation
import MapKit


class ViewController: UIViewController {

    let locManager = CLLocationManager()
    var mapViewCenter = CLLocationCoordinate2D(latitude: 0, longitude: 0)
    var didInitialCenter = false

    @IBOutlet weak var mapView: MKMapView!

    var routes = [Int:MKOverlay]() {
        didSet {
            if let _ = routes[1] {
                //                showRoute(num: 1)
            }
        }
    }
    var routeCount = 0
    var pt1,pt2 : CLLocationCoordinate2D!

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        NotificationCenter.default.addObserver(forName: NSNotification.Name("NewLocation"), object: nil, queue: .main, using: {note in
            guard let info = note.userInfo, let loc = info["location"] as? CLLocation else { return }
            let force = info["force"] as? Bool ?? false
            if force || !self.didInitialCenter {
                let reg = MKCoordinateRegion(center: loc.coordinate, span: MKCoordinateSpan(latitudeDelta: 0.005, longitudeDelta: 0.005))
                self.mapView.setRegion(reg, animated: true)
                self.didInitialCenter = true
            }
        })
        
        startLocation()
        genRoute()
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            self.showRoute(num: 1)
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

extension ViewController {
    func showRoute(num:Int) {
        guard let route = routes[num] else { return }
        self.mapView.add(route, level: MKOverlayLevel.aboveRoads)
        
        let rect = route.boundingMapRect
        let mr = MKMapRectInset(rect, -rect.size.width * 0.1, -rect.size.height * 0.2)
        self.mapView.setRegion(MKCoordinateRegionForMapRect(mr), animated: true)
    }
    func hideRoute(num:Int) {
        guard let route = routes[num] else { return }
        self.mapView.remove(route)
    }

    func genRoute() {
//    func genRoute(start:CLLocationCoordinate2D, end:CLLocationCoordinate2D, color:UIColor) {
        let annotation = MKPointAnnotation()
        let centerCoordinate = CLLocationCoordinate2D(latitude: 33.772187, longitude:-118.237019)
        annotation.coordinate = centerCoordinate
        annotation.title = "Pickup"
        mapView.addAnnotation(annotation)
        
        let dest = MKPointAnnotation()
        let lat = (Double(arc4random_uniform(400)) - 200.0) / 10000.0
        let lon = (Double(arc4random_uniform(100)) - 50.0) / 10000.0
        let dcenterCoordinate = CLLocationCoordinate2D(latitude: 33.854187 + lat, longitude:-118.232019 + lon)
        pt1 = dcenterCoordinate
        dest.coordinate = dcenterCoordinate
        dest.title = "Destination"
        mapView.addAnnotation(dest)
        
        
        let sourcePlacemark = MKPlacemark(coordinate: centerCoordinate, addressDictionary: nil)
        let destinationPlacemark = MKPlacemark(coordinate: dcenterCoordinate, addressDictionary: nil)
        
        let sourceMapItem = MKMapItem(placemark: sourcePlacemark)
        let destinationMapItem = MKMapItem(placemark: destinationPlacemark)
        
        let directionRequest = MKDirectionsRequest()
        directionRequest.source = sourceMapItem
        directionRequest.destination = destinationMapItem
        directionRequest.transportType = .automobile
        
        // Calculate the direction
        let directions = MKDirections(request: directionRequest)
        
        directions.calculate {
            (response, error) -> Void in
            
            guard let response = response else {
                if let error = error {
                    print("Error: \(error)")
                }
                
                return
            }
            
            let route = response.routes[0]
            /*
             self.mapView.add((route.polyline), level: MKOverlayLevel.aboveRoads)
             
             let rect = route.polyline.boundingMapRect
             let mr = MKMapRectInset(rect, 0, 100)
             self.mapView.setRegion(MKCoordinateRegionForMapRect(mr), animated: true)
             */
            self.routes[1] = route.polyline
        }
    }

}

extension ViewController : MKMapViewDelegate {
    
    func mapViewDidFinishLoadingMap(_ mapView: MKMapView) {
    }
    
    func mapView(_ mapView: MKMapView, regionDidChangeAnimated animated: Bool) {
        let mc = mapView.centerCoordinate
        let newCenter = CLLocation(latitude: mc.latitude, longitude: mc.longitude)
        let oldCenter = CLLocation(latitude: mapViewCenter.latitude, longitude: mapViewCenter.longitude)
        if newCenter.distance(from: oldCenter) > 50 {
            mapViewCenter = mc
        }
    }
    
    func mapView(_ mapView: MKMapView, rendererFor overlay: MKOverlay) -> MKOverlayRenderer {
        let renderer = MKPolylineRenderer(overlay: overlay)
        renderer.strokeColor = routeCount == 0 ? UIColor.red : (routeCount == 1 ? UIColor.orange : UIColor.blue)
        renderer.lineWidth = 4.0
        
        routeCount += 1
        return renderer
    }
}

extension ViewController : CLLocationManagerDelegate {
    
    func startLocation() {
        locManager.delegate = self
        locManager.desiredAccuracy = kCLLocationAccuracyBest
        locManager.activityType = .automotiveNavigation
        locManager.distanceFilter = 25
        locManager.allowsBackgroundLocationUpdates = true
        
        let status = CLLocationManager.authorizationStatus()
        if status == .authorizedAlways || status == .authorizedWhenInUse {
            locManager.startUpdatingLocation()
        } else {
            locManager.requestAlwaysAuthorization()
        }
    }
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if status == .authorizedAlways || status == .authorizedWhenInUse {
            locManager.startUpdatingLocation()
        }
    }
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        
        guard let loc = locations.first else { return }
        NotificationCenter.default.post(name: NSNotification.Name("NewLocation"), object: nil, userInfo: ["location":loc])
        
    }
    
}
