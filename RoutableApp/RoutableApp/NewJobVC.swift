//
//  NewJobVC.swift
//  RoutableApp
//
//  Created by Edward Arenberg on 4/14/18.
//  Copyright © 2018 Edward Arenberg. All rights reserved.
//

import UIKit
import MapKit

struct Job {
    let portName : String
    let dropAddr : String
    let dropLoc : CLLocationCoordinate2D
    let pickAddr : String
    let pickLoc : CLLocationCoordinate2D
}

class NewJobVC: UIViewController {
    
    var job : Job! {
        didSet {
            dropAddressLabel.text = job.dropAddr
            let regD = MKCoordinateRegion(center: job.dropLoc, span: MKCoordinateSpan(latitudeDelta: 0.005, longitudeDelta: 0.005))
            dropMapView.setRegion(regD, animated: true)
            let annotationD = MKPointAnnotation()
            annotationD.coordinate = job.dropLoc
            annotationD.title = "Dropoff"
            dropMapView.addAnnotation(annotationD)
            
            pickAddressLabel.text = job.pickAddr
            let regP = MKCoordinateRegion(center: job.pickLoc, span: MKCoordinateSpan(latitudeDelta: 0.005, longitudeDelta: 0.005))
            pickMapView.setRegion(regP, animated: true)
            let annotationP = MKPointAnnotation()
            annotationP.coordinate = job.pickLoc
            annotationP.title = "Pickup"
            pickMapView.addAnnotation(annotationP)
        }
    }

    @IBOutlet weak var mtoLabel: UILabel!
    
    @IBOutlet weak var dropView: UIView! {
        didSet {
            dropView.layer.cornerRadius = 20
            dropView.layer.borderWidth = 1
            dropView.layer.borderColor = UIColor.lightGray.cgColor
        }
    }
    @IBOutlet weak var dropAddressLabel: UILabel!
    @IBOutlet weak var dropMapView: MKMapView!
    
    @IBOutlet weak var pickView: UIView! {
        didSet {
            pickView.layer.cornerRadius = 20
            pickView.layer.borderWidth = 1
            pickView.layer.borderColor = UIColor.lightGray.cgColor
        }
    }
    @IBOutlet weak var pickAddressLabel: UILabel!
    @IBOutlet weak var pickMapView: MKMapView!
    
    @IBOutlet weak var declineButton: UIButton! {
        didSet {
            declineButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 30, bottom: 8, right: 30)
            declineButton.layer.cornerRadius = 10
            declineButton.layer.borderWidth = 2
            declineButton.layer.borderColor = UIColor.white.cgColor
        }
    }
    @IBAction func declineHit(_ sender: UIButton) {
        dismiss(animated: true, completion: nil)
    }
    
    @IBOutlet weak var acceptButton: UIButton! {
        didSet {
            acceptButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 30, bottom: 8, right: 30)
            acceptButton.layer.cornerRadius = 10
            acceptButton.layer.borderWidth = 2
            acceptButton.layer.borderColor = UIColor.white.cgColor
        }
    }
    @IBAction func acceptHit(_ sender: UIButton) {
        dismiss(animated: true, completion: {
            NotificationCenter.default.post(name: NSNotification.Name("AcceptJob"), object: nil, userInfo: ["Job":self.job])
        })
    }
    
    @IBOutlet weak var ladingView: UIView!
    @IBAction func ladingHit(_ sender: UIButton) {
        UIView.animate(withDuration: 0.4, animations: {self.ladingView.alpha = 1})
    }
    @IBAction func laddingTapped(_ sender: UITapGestureRecognizer) {
        UIView.animate(withDuration: 0.4, animations: {self.ladingView.alpha = 0})
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
