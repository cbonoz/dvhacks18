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

extension ViewController : MKMapViewDelegate {
    
}

class ViewController: UIViewController {

    @IBOutlet weak var mapView: MKMapView!

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

