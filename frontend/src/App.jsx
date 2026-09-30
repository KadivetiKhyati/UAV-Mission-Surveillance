import { useEffect, useState } from "react";
import "./App.css";

const API = "https://uav-mission-surveillance.onrender.com";

function App() {
  const [uavs, setUavs] = useState([]);
  const [missions, setMissions] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");

  useEffect(() => {
    fetchUAVs();
    fetchMissions();
  }, []);

  const fetchUAVs = async () => {
    try {
      const response = await fetch(`${API}/api/uavs`);
      const data = await response.json();
      setUavs(data);
    } catch (error) {
      console.error("Error fetching UAVs:", error);
    }
  };

  const fetchMissions = async () => {
    try {
      const response = await fetch(`${API}/api/missions`);
      const data = await response.json();
      setMissions(data);
    } catch (error) {
      console.error("Error fetching missions:", error);
    }
  };

  const navItems = [
    "Dashboard",
    "UAV Fleet",
    "Missions",
    "Telemetry",
    "Alerts",
    "Analytics",
    "Reports"
  ];

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          🛩️ UAV MISSION
        </div>

        {navItems.map((item) => (
          <div
            key={item}
            className={`nav-item ${
              activePage === item ? "active" : ""
            }`}
            onClick={() => setActivePage(item)}
          >
            {item}
          </div>
        ))}

      </aside>


      {/* MAIN CONTENT */}

      <main className="main">

        <header className="header">

          <div>
            <h1>{activePage}</h1>

            <p>
              UAV Mission & Surveillance
              Management System
            </p>
          </div>

          <div className="system-status">
            ● System Online
          </div>

        </header>


        {/* DASHBOARD */}

        {activePage === "Dashboard" && (
          <>
            <section className="stats">

              <div className="stat-card">
                <h3>Total UAVs</h3>
                <p>{uavs.length}</p>
              </div>

              <div className="stat-card">
                <h3>Available</h3>
                <p>
                  {
                    uavs.filter(
                      (uav) => uav.status === "Available"
                    ).length
                  }
                </p>
              </div>

              <div className="stat-card">
                <h3>On Mission</h3>
                <p>
                  {
                    uavs.filter(
                      (uav) => uav.status === "On Mission"
                    ).length
                  }
                </p>
              </div>

              <div className="stat-card">
                <h3>Total Missions</h3>
                <p>{missions.length}</p>
              </div>

            </section>

            <UAVSection uavs={uavs} />

            <MissionSection
              missions={missions}
              setMissions={setMissions}
              fetchUAVs={fetchUAVs}
            />
          </>
        )}


        {/* UAV FLEET */}

        {activePage === "UAV Fleet" && (
          <UAVSection uavs={uavs} />
        )}


        {/* MISSIONS */}

        {activePage === "Missions" && (
          <>
            <MissionForm
              uavs={uavs}
              setMissions={setMissions}
            />

            <MissionSection
              missions={missions}
              setMissions={setMissions}
              fetchUAVs={fetchUAVs}
            />
          </>
        )}


        {/* TELEMETRY */}

        {activePage === "Telemetry" && (
          <TelemetrySection uavs={uavs} />
        )}


        {/* ALERTS */}

        {activePage === "Alerts" && (
          <AlertsSection
            uavs={uavs}
            missions={missions}
          />
        )}


        {/* ANALYTICS */}

        {activePage === "Analytics" && (
          <AnalyticsSection
            uavs={uavs}
            missions={missions}
          />
        )}


        {/* REPORTS */}

        {activePage === "Reports" && (
          <ReportsSection
            uavs={uavs}
            missions={missions}
          />
        )}

      </main>
    </div>
  );
}


/* =====================================================
   UAV SECTION
===================================================== */

function UAVSection({ uavs }) {

  return (
    <section className="uav-section">

      <h2>UAV Fleet</h2>

      <div className="uav-grid">

        {uavs.map((uav) => (

          <div
            className="uav-card"
            key={uav._id}
          >

            <div className="uav-header">

              <h3>{uav.name}</h3>

              <span className="status">
                ● {uav.status}
              </span>

            </div>

            <div className="uav-info">

              <div>
                UAV ID: {uav.uavId}
              </div>

              <div>
                Type: {uav.type}
              </div>

            </div>

            <div className="battery">

              <div className="battery-label">

                <span>Battery</span>

                <span>
                  {uav.battery}%
                </span>

              </div>

              <div className="battery-bar">

                <div
                  className="battery-fill"
                  style={{
                    width: `${uav.battery}%`,
                    background:
                      uav.battery > 60
                        ? "#4ade80"
                        : uav.battery > 30
                        ? "#facc15"
                        : "#ef4444"
                  }}
                ></div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}


/* =====================================================
   MISSION SECTION
===================================================== */

function MissionSection({
  missions,
  setMissions,
  fetchUAVs
}) {

  const updateStatus = async (
    missionId,
    newStatus
  ) => {

    try {

      const response = await fetch(
        `${API}/api/missions/${missionId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const updatedMission =
        await response.json();

      if (!response.ok) {

        alert(
          updatedMission.message ||
          "Failed to update mission"
        );

        return;
      }

      setMissions(
        (currentMissions) =>
          currentMissions.map(
            (mission) =>
              mission._id === updatedMission._id
                ? updatedMission
                : mission
          )
      );

      await fetchUAVs();

    } catch (error) {

      console.error(
        "Error updating mission:",
        error
      );

      alert(
        "Could not connect to backend."
      );
    }
  };


  return (
    <section className="uav-section">

      <h2>
        Mission Network
      </h2>

      <div className="uav-grid">

        {missions.map((mission) => (

          <div
            className="uav-card mission-card"
            key={mission._id}
          >

            <div className="uav-header">

              <h3>
                {mission.missionName}
              </h3>

              <span className="mission-status">
                ● {mission.status}
              </span>

            </div>

            <div className="uav-info">

              <div>
                Mission ID: {mission.missionId}
              </div>

              <div>
                Assigned UAV: {mission.assignedUAV}
              </div>

              <div>
                Mission Type: {mission.missionType}
              </div>

            </div>

            <div className="mission-actions">

              {mission.status === "Planned" && (

                <button
                  onClick={() =>
                    updateStatus(
                      mission._id,
                      "Active"
                    )
                  }
                >
                  ▶ Activate
                </button>

              )}

              {mission.status === "Active" && (

                <button
                  onClick={() =>
                    updateStatus(
                      mission._id,
                      "Completed"
                    )
                  }
                >
                  ✓ Complete
                </button>

              )}

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}


/* =====================================================
   MISSION FORM
===================================================== */

function MissionForm({
  uavs,
  setMissions
}) {

  const [missionId, setMissionId] =
    useState("");

  const [missionName, setMissionName] =
    useState("");

  const [assignedUAV, setAssignedUAV] =
    useState("");

  const [missionType, setMissionType] =
    useState("Surveillance");

  const [status, setStatus] =
    useState("Planned");


  const createMission = async (event) => {

    event.preventDefault();

    const newMission = {
      missionId,
      missionName,
      assignedUAV,
      missionType,
      status
    };

    try {

      const response = await fetch(
        `${API}/api/missions`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(newMission)
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        alert(
          data.message ||
          "Failed to create mission"
        );

        return;
      }

      setMissions(
        (currentMissions) => [
          ...currentMissions,
          data
        ]
      );

      setMissionId("");
      setMissionName("");
      setAssignedUAV("");
      setMissionType("Surveillance");
      setStatus("Planned");

      alert(
        "Mission created successfully!"
      );

    } catch (error) {

      console.error(
        "Error creating mission:",
        error
      );

      alert(
        "Could not connect to backend."
      );
    }
  };


  return (
    <section className="mission-form">

      <h2>
        Create New Mission
      </h2>

      <form onSubmit={createMission}>

        <input
          type="text"
          placeholder="Mission ID (e.g. MSN-002)"
          value={missionId}
          onChange={(e) =>
            setMissionId(e.target.value)
          }
          required
        />

        <input
          type="text"
          placeholder="Mission Name"
          value={missionName}
          onChange={(e) =>
            setMissionName(e.target.value)
          }
          required
        />

        <select
          value={assignedUAV}
          onChange={(e) =>
            setAssignedUAV(e.target.value)
          }
          required
        >

          <option value="">
            Select UAV
          </option>

          {uavs.map((uav) => (

            <option
              key={uav._id}
              value={uav.uavId}
            >
              {uav.uavId} — {uav.name}
            </option>

          ))}

        </select>

        <select
          value={missionType}
          onChange={(e) =>
            setMissionType(e.target.value)
          }
        >

          <option value="Surveillance">
            Surveillance
          </option>

          <option value="Reconnaissance">
            Reconnaissance
          </option>

          <option value="Patrol">
            Patrol
          </option>

          <option value="Training">
            Training
          </option>

        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >

          <option value="Planned">
            Planned
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Aborted">
            Aborted
          </option>

        </select>

        <button type="submit">
          + Create Mission
        </button>

      </form>

    </section>
  );
}


/* =====================================================
   TELEMETRY
===================================================== */

function TelemetrySection({ uavs }) {

  return (
    <section className="uav-section">

      <h2>
        UAV Telemetry
      </h2>

      <div className="uav-grid">

        {uavs.map((uav) => (

          <div
            className="uav-card"
            key={uav._id}
          >

            <div className="uav-header">

              <h3>
                {uav.name}
              </h3>

              <span className="status">
                ● {uav.status}
              </span>

            </div>

            <div className="uav-info">

              <div>
                UAV ID: {uav.uavId}
              </div>

              <div>
                Platform Type: {uav.type}
              </div>

              <div>
                Battery Level: {uav.battery}%
              </div>

              <div>
                Operational Status: {uav.status}
              </div>

            </div>

            <div className="battery">

              <div className="battery-label">

                <span>
                  Battery
                </span>

                <span>
                  {uav.battery}%
                </span>

              </div>

              <div className="battery-bar">

                <div
                  className="battery-fill"
                  style={{
                    width: `${uav.battery}%`,
                    background:
                      uav.battery > 60
                        ? "#4ade80"
                        : uav.battery > 30
                        ? "#facc15"
                        : "#ef4444"
                  }}
                ></div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}


/* =====================================================
   ALERTS
===================================================== */

function AlertsSection({
  uavs,
  missions
}) {

  const alerts = [];

  uavs.forEach((uav) => {

    if (uav.battery <= 30) {

      alerts.push({
        type: "LOW BATTERY",
        message:
          `${uav.name} battery is at ${uav.battery}%`,
        level: "Critical"
      });

    }

    if (uav.status === "Maintenance") {

      alerts.push({
        type: "MAINTENANCE",
        message:
          `${uav.name} is currently under maintenance`,
        level: "Warning"
      });

    }

  });


  missions.forEach((mission) => {

    if (mission.status === "Active") {

      alerts.push({
        type: "ACTIVE MISSION",
        message:
          `${mission.missionId} assigned to ${mission.assignedUAV} is active`,
        level: "Information"
      });

    }

  });


  return (
    <section className="uav-section">

      <h2>
        System Alerts
      </h2>

      <div className="uav-grid">

        {alerts.length > 0 ? (

          alerts.map((alert, index) => (

            <div
              className="uav-card"
              key={index}
            >

              <div className="uav-header">

                <h3>
                  {alert.type}
                </h3>

                <span className="mission-status">
                  ● {alert.level}
                </span>

              </div>

              <div className="uav-info">
                {alert.message}
              </div>

            </div>

          ))

        ) : (

          <div className="uav-card">

            <div className="uav-header">

              <h3>
                SYSTEM STATUS
              </h3>

              <span className="status">
                ● NORMAL
              </span>

            </div>

            <div className="uav-info">

              <div>
                ✓ No low-battery UAVs
              </div>

              <div>
                ✓ No UAVs under maintenance
              </div>

              <div>
                ✓ No active mission alerts
              </div>

              <div>
                ✓ All monitored conditions normal
              </div>

            </div>

          </div>

        )}

      </div>

    </section>
  );
}


/* =====================================================
   ANALYTICS
===================================================== */

function AnalyticsSection({
  uavs,
  missions
}) {

  const totalUAVs = uavs.length;

  const availableUAVs =
    uavs.filter(
      (uav) =>
        uav.status === "Available"
    ).length;

  const activeUAVs =
    uavs.filter(
      (uav) =>
        uav.status === "On Mission"
    ).length;

  const activeMissions =
    missions.filter(
      (mission) =>
        mission.status === "Active"
    ).length;

  const completedMissions =
    missions.filter(
      (mission) =>
        mission.status === "Completed"
    ).length;

  const plannedMissions =
    missions.filter(
      (mission) =>
        mission.status === "Planned"
    ).length;


  return (
    <section className="uav-section">

      <h2>
        Mission Analytics
      </h2>

      <div className="stats">

        <div className="stat-card">
          <h3>Total UAVs</h3>
          <p>{totalUAVs}</p>
        </div>

        <div className="stat-card">
          <h3>Available UAVs</h3>
          <p>{availableUAVs}</p>
        </div>

        <div className="stat-card">
          <h3>UAVs On Mission</h3>
          <p>{activeUAVs}</p>
        </div>

        <div className="stat-card">
          <h3>Active Missions</h3>
          <p>{activeMissions}</p>
        </div>

        <div className="stat-card">
          <h3>Completed Missions</h3>
          <p>{completedMissions}</p>
        </div>

        <div className="stat-card">
          <h3>Planned Missions</h3>
          <p>{plannedMissions}</p>
        </div>

        <div className="stat-card">
          <h3>Total Missions</h3>
          <p>{missions.length}</p>
        </div>

      </div>

    </section>
  );
}


/* =====================================================
   REPORTS
===================================================== */

function ReportsSection({
  uavs,
  missions
}) {

  const available =
    uavs.filter(
      (uav) =>
        uav.status === "Available"
    ).length;

  const onMission =
    uavs.filter(
      (uav) =>
        uav.status === "On Mission"
    ).length;

  const planned =
    missions.filter(
      (mission) =>
        mission.status === "Planned"
    ).length;

  const active =
    missions.filter(
      (mission) =>
        mission.status === "Active"
    ).length;

  const completed =
    missions.filter(
      (mission) =>
        mission.status === "Completed"
    ).length;


  return (
    <section className="uav-section">

      <h2>
        Mission Reports
      </h2>

      <div className="uav-grid">

        <div className="uav-card">

          <div className="uav-header">

            <h3>
              Fleet Report
            </h3>

            <span className="status">
              ● ONLINE
            </span>

          </div>

          <div className="uav-info">

            <div>
              Total UAVs: {uavs.length}
            </div>

            <div>
              Available: {available}
            </div>

            <div>
              On Mission: {onMission}
            </div>

          </div>

        </div>


        <div className="uav-card">

          <div className="uav-header">

            <h3>
              Mission Report
            </h3>

            <span className="status">
              ● UPDATED
            </span>

          </div>

          <div className="uav-info">

            <div>
              Total Missions: {missions.length}
            </div>

            <div>
              Planned: {planned}
            </div>

            <div>
              Active: {active}
            </div>

            <div>
              Completed: {completed}
            </div>

          </div>

        </div>


        <div className="uav-card">

          <div className="uav-header">

            <h3>
              System Summary
            </h3>

          </div>

          <div className="uav-info">

            <div>
              Fleet Records: {uavs.length}
            </div>

            <div>
              Mission Records: {missions.length}
            </div>

            <div>
              Database Status: Connected
            </div>

            <div>
              System Status: Operational
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


export default App;