//
//  OfflineVC.swift
//  RoutableApp
//
//  Created by Edward Arenberg on 4/14/18.
//  Copyright © 2018 Edward Arenberg. All rights reserved.
//

import UIKit
import CoreLocation
import Contacts

class OfflineVC: UIViewController {

    private var isActive = false
    private var pendingRequestWorkItem: DispatchWorkItem?

    @IBOutlet weak var activeButton: UIButton! {
        didSet {
            activeButton.contentEdgeInsets = UIEdgeInsets(top: 8, left: 20, bottom: 8, right: 20)
            activeButton.layer.cornerRadius = 10
            activeButton.layer.borderWidth = 2
            activeButton.layer.borderColor = UIColor.white.cgColor
        }
    }
    @IBAction func activeHit(_ sender: UIButton) {
        /*
        if let vc = self.storyboard?.instantiateViewController(withIdentifier: "ViewController") {
            self.view.window?.rootViewController = vc
        }
         */
        isActive = !isActive
        UIView.animate(withDuration: 0.4) {
            self.activeButton.setTitle(self.isActive ? "Pause" : "Active", for: .normal)
            self.seekingSV.isHidden = !self.isActive
        }
        if isActive {
            fetchJob()
        } else {
            pendingRequestWorkItem?.cancel()
        }
    }
    @IBOutlet weak var seekingSV: UIStackView!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        NotificationCenter.default.addObserver(forName: NSNotification.Name("AcceptJob"), object: nil, queue: .main, using: { notification in
            guard let job = notification.userInfo?["Job"] as? Job else { return }
            if let vc = self.storyboard?.instantiateViewController(withIdentifier: "ViewController") as? ViewController {
                vc.job = job
                self.view.window?.rootViewController = vc
            }
        })
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in
            if let active = self?.isActive {
                if active {
                    self?.fetchJob()
                }
            }
        }
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

extension OfflineVC {
    
    private struct Route {
        let ports : [Int]
    }
    private struct Port {
        let id : Int
        let name : String
        let lat : Double
        let lng : Double
        init(dict:[String:Any]) {
            id = dict["id"] as? Int ?? 0
            name = dict["name"] as? String ?? "Port"
            lat = dict["lat"] as? Double ?? 0.0
            lng = dict["lng"] as? Double ?? 0.0
        }
    }
    
    private func fetchJob() {
        guard let u = URL(string: "http://3acf7924.ngrok.io/api/schedule") else { return }

        var req = URLRequest(url: u)
        req.httpMethod = "POST"
        req.setValue("application/json; charset=utf-8", forHTTPHeaderField: "Content-Type")

        let json : [String:Any] = ["jobDate":"4-14-2018",
                                   "numVehicles":50]
        let jsonData = try? JSONSerialization.data(withJSONObject: json, options: [])
        req.httpBody = jsonData
        
        let task = URLSession.shared.dataTask(with: req) { data, response, error in
            guard error == nil else { print(error!); return }
            guard let data = data else { return }
            do {
//                if let str = String(data: data, encoding: .utf8) {
//                    print(str)
//                }
//                let route = try JSONDecoder().decode(Route.self, from: data)
                guard let result = try JSONSerialization.jsonObject(with: data, options: []) as? [String:Any] else { return }
//                print(result)

                guard let portObjs : [[String:Any]] = result["ports"] as? [[String : Any]] else { return }
                let ports = portObjs.map { Port(dict: $0) }

                guard let routeObjs : [[Int]] = result["routes"] as? [[Int]] else { return }
                let routes = routeObjs.map { Route(ports: $0) }
                var route : Route
                
                repeat {
                    let idx = Int(arc4random_uniform(UInt32(routes.count)))
                    route = routes[idx]
                } while route.ports.count < 2
                
                let mto = ports[0]
                let p1 = ports[route.ports[0]]
                let loc1 = CLLocationCoordinate2D(latitude: p1.lat, longitude: p1.lng)
                var addr1 = ""
                let p2 = ports[route.ports[1]]
                let loc2 = CLLocationCoordinate2D(latitude: p2.lat, longitude: p2.lng)
                var addr2 = ""
                
                print(loc1)
                print(loc2)
                
                let coder1 = CLGeocoder()
                let coder2 = CLGeocoder()

                let dg = DispatchGroup()
                dg.enter()
                coder1.reverseGeocodeLocation(CLLocation(latitude: loc1.latitude, longitude: loc1.longitude), completionHandler: { marks, error in
                    defer { dg.leave() }
                    if let _ = error { return }
                    guard let place = marks?.first else { return }
                    
                    if let addr = place.postalAddress {
                        let str = addr.street
                        let city = addr.city
                        let state = addr.state
                        let zip = addr.postalCode
                        addr1 = "\(str)\n\(city), \(state) \(zip)"
                        print(addr1)
                    }

                    /*
                    guard let state = place.administrativeArea,
                        let city = place.locality,
                        let zip = place.postalCode
                        else { return }
//                    addr1 = place.formattedAddress
                    */
                })
                
                dg.enter()
                coder2.reverseGeocodeLocation(CLLocation(latitude: loc2.latitude, longitude: loc2.longitude), completionHandler: { marks, error in
                    defer { dg.leave() }
                    if let _ = error { return }
                    guard let place = marks?.first else { return }
                    
                    if let addr = place.postalAddress {
                        let str = addr.street
                        let city = addr.city
                        let state = addr.state
                        let zip = addr.postalCode
                        addr2 = "\(str)\n\(city), \(state) \(zip)"
                        print(addr2)
                    }
                })

                dg.notify(queue: .main) {
                    let job = Job(portName: "San Pedro: Port 3",
                                  dropAddr: addr1,
                                  dropLoc: loc1,
                                  pickAddr: addr2,
                                  pickLoc: loc2
                    )
                    self.gotJob(job: job)
                }
                
                
//                DispatchQueue.main.async {
//                }
                
            } catch let e {
                print(e)
            }
        }
        task.resume()
    }
    
    private func getJob(callback:(Job)->()) {
        let dloc = CLLocationCoordinate2D(latitude: 33.9012292, longitude: -118.391747)
        let daddr = "1240 Rosecrans\nManhattan Beach, CA 90266"
        let ploc = CLLocationCoordinate2D(latitude: 34.053718, longitude: -118.2448473)
        let paddr = "200 N Spring St\nLos Angeles, CA 90012"
        let job = Job(portName: "San Pedro: Port 4",
                      dropAddr: daddr, dropLoc: dloc, pickAddr: paddr, pickLoc: ploc)
//        self.job = job

        let requestWorkItem = DispatchWorkItem { [weak self] in
            self?.gotJob(job: job)
        }
        // Save the new work item and execute it after 250 ms
        pendingRequestWorkItem = requestWorkItem
        DispatchQueue.main.asyncAfter(deadline: .now() + 4,
                                      execute: requestWorkItem)

    }
    
    func gotJob(job:Job) {
        if let vc = self.storyboard?.instantiateViewController(withIdentifier: "NewJobVC") as? NewJobVC {
            self.present(vc, animated: true, completion: {
                vc.job = job
            })
        }
    }
    
}
