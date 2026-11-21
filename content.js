/* All the text on the site lives here. Nothing else needs editing to change content.
   Resume content comes from Francesc-Vendrell-CV.pdf, projects from github.com/xesco. */
window.PORTFOLIO = {
  name: "Francesc Vendrell Soler",
  role: "Site Reliability Engineer",
  product: "PORTFOLIO",                    // shown in Setup and the DOS prompt, keep it short and uppercase
  version: "1.0",

  photo: {                                // made from a photo with tools/portrait.html
    vga: "portrait-vga.png",
    ega: "",                               // optional second picture, e.g. "portrait-ega.png": adds an EGA/VGA switch
    style: "vga",                          // which one shows first when both are set
    caption: "Me"                          // empty hides it
  },

  about: [                                 // README.TXT
    "Hello. I am Francesc, a Site Reliability Engineer based in Barcelona, Spain.",
    "I scale and operate resilient infrastructure through high-growth phases, with deep expertise in AWS and Kubernetes. I bridge software engineering and operations to streamline deployments, strengthen observability and keep systems running smoothly at scale."
  ],

  resume: {
    pdf: "",                               // optional: path to a PDF, e.g. "resume.pdf". Empty hides the button.
    summary: "Site Reliability Engineer with experience scaling and operating resilient infrastructure through high-growth phases. I focus on reliability, performance and scalability in fast-paced environments, with deep expertise in AWS and Kubernetes. I bridge software engineering and operations to streamline deployments, strengthen observability and ensure systems run smoothly at scale.",
    experience: [
      {
        role: "Site Reliability Engineer (remote)",
        company: "Sysdig",
        when: "04/2026 - present",
        notes: [
          "Operate and scale the Kubernetes and AWS infrastructure behind Sysdig's cloud security and observability platform, focusing on reliability and performance at scale.",
          "Maintain and improve Infrastructure as Code (Terraform) to manage multi-region AWS environments in a consistent, auditable way."
        ]
      },
      {
        role: "Site Reliability Engineer (remote)",
        company: "Mezmo (formerly LogDNA, YC W15)",
        when: "02/2021 - 09/2025",
        notes: [
          "Scaled a cloud-native observability platform running Kubernetes clusters across multiple regions.",
          "Implemented automated upgrade processes for very large Kubernetes clusters (500+ nodes), so teams could focus on development rather than maintenance.",
          "Designed and tested an External SNAT architecture for EKS with AWS VPC CNI custom networking; improved egress observability and reduced troubleshooting time.",
          "Migrated 50+ Terraform modules to Terramate, cutting code duplication and enabling consistent multi-cloud deployments.",
          "Drove adoption of observability tooling (Grafana, Sysdig) with dashboards and metrics for cluster performance and reliability.",
          "Led Disaster Recovery testing for global clusters: deployed full platform stacks in a sandbox, simulated zone failures and implemented IaC fixes, reducing manual recovery steps.",
          "Built Python CLI tools that simplify environment setup, configuration and testing for internal teams, speeding up onboarding and reducing errors.",
          "Built and maintained GitOps workflows (Terraform, Terramate, CI/CD pipelines) that give engineers self-service infrastructure, cutting SRE toil.",
          "Architected and executed cost-optimization strategies (advanced search tech, Kubernetes autoscaling, resource right-sizing) that reduced monthly infrastructure spend."
        ]
      },
      {
        role: "Site Reliability Engineer (remote)",
        company: "CAPSiDE | NTT",
        when: "12/2018 - 01/2021",
        notes: [
          "Architected a Site-to-Site VPN with a Transit Gateway: a secure, scalable IPsec bridge between a client's on-premises infrastructure and AWS.",
          "Implemented an automated regression test suite to secure a mission-critical payment system, ensuring PCI compliance and simplifying integration into other pipelines.",
          "Managed complex take-on projects with pre-existing infrastructure and production workloads, modernizing practices with minimal disruption.",
          "Introduced Terraform and Ansible into live customer environments, making legacy infrastructure maintainable, auditable and reproducible.",
          "Diagnosed and resolved production issues across Linux-based distributed systems, improving uptime for mission-critical financial platforms."
        ]
      },
      {
        role: "DevOps Engineer, previously Back End Developer",
        company: "Bynder",
        when: "09/2015 - 08/2018",
        notes: [
          "Led the move from a monolithic Digital Asset Management application to microservices: Dockerized all services, streamlined local development and enabled a CI/CD release pipeline across development, testing and staging.",
          "Spearheaded the transition to a mono-repo, improving codebase consistency, dependency tracking and cross-team collaboration.",
          "Managed bare-metal Dell servers and hypervisors providing virtual machines for developers, plus user management and office infrastructure services.",
          "Developed backend services in Python (Django): RESTful APIs and data models for asset ingestion, metadata handling and search.",
          "Built a Python + Celery messaging system for asynchronous processing, delivering hundreds of thousands of reliable notifications daily.",
          "Wrote unit and integration tests and wired them into CI (Jenkins) to automate release pipelines."
        ]
      }
    ],
    education: [
      { title: "BS in Computer Science", place: "Universitat Politècnica de Catalunya", when: "2006 - 2012" }
    ],
    certifications: [                      // optional; an empty list hides the section
      { title: "AWS Certified SysOps Administrator - Associate (SOA-C02)", place: "AWS Training and Certification", when: "12/2022 - 12/2025" }
    ],
    skills: [                              // grouped from the technologies named in the CV
      { group: "Cloud", items: ["AWS", "EKS", "VPC networking", "Transit Gateway", "multi-region"] },
      { group: "Platform", items: ["Kubernetes", "Docker", "Linux"] },
      { group: "IaC", items: ["Terraform", "Terramate", "Ansible", "GitOps"] },
      { group: "Observe", items: ["Grafana", "Sysdig"] },
      { group: "Code", items: ["Python", "Django", "Celery", "REST APIs"] },
      { group: "Delivery", items: ["CI/CD", "Jenkins", "Disaster Recovery testing"] }
    ]
  },

  projects: [                              // from github.com/xesco, newest first; text is each repository's own description
    {
      name: "opm86",
      file: "OPM86.EXE",
      year: "2026",
      stack: ["C++"],
      text: ["Plays VGM music from Sega's 1980s arcade games on emulated YM2151 and Sega PCM chips."],
      links: [{ label: "Source", url: "https://github.com/xesco/opm86" }]
    },
    {
      name: "snapcas",
      file: "SNAPCAS.COM",
      year: "2026",
      stack: ["Z80 assembly", "Python", "openMSX"],
      text: ["Snapshots MSX cassette games in openMSX and restores them on a real MSX from disk or SD."],
      links: [{ label: "Source", url: "https://github.com/xesco/snapcas" }]
    },
    {
      name: "dosctl",
      file: "DOSCTL.EXE",
      year: "2025",
      stack: ["Python", "DOSBox"],
      text: ["A command-line tool to manage and play DOS games via DOSBox."],
      links: [{ label: "Source", url: "https://github.com/xesco/dosctl" }]
    },
    {
      name: "pivine",
      file: "PIVINE.EXE",
      year: "2026",
      stack: ["Python", "Raspberry Pi", "Ubuntu"],
      text: ["Installs Chromium and Widevine for Netflix and other DRM streaming on Ubuntu for Raspberry Pi."],
      links: [{ label: "Source", url: "https://github.com/xesco/pivine" }]
    },
    {
      name: "osx-shifter",
      file: "SHIFTER.EXE",
      year: "2026",
      stack: ["Rust", "macOS"],
      text: ["Delays any audio source to sync it with video."],
      links: [{ label: "Source", url: "https://github.com/xesco/osx-shifter" }]
    },
    {
      name: "simple-k8s-operator",
      file: "K8SOPER.EXE",
      year: "2026",
      stack: ["Python", "Kubernetes"],
      text: ["A simple Kubernetes operator."],
      links: [{ label: "Source", url: "https://github.com/xesco/simple-k8s-operator" }]
    },
    {
      name: "msx-w2c",
      file: "MSXW2C.EXE",
      year: "2026",
      stack: ["Rust", "MSX"],
      text: ["A Rust version of the WAV to CAS converter for MSX cassette images."],
      links: [{ label: "Source", url: "https://github.com/xesco/msx-w2c" }]
    }
  ],

  contact: [
    { label: "E-mail", text: "xescoo@gmail.com", url: "mailto:xescoo@gmail.com" },
    { label: "LinkedIn", text: "linkedin.com/in/fvendrell", url: "https://www.linkedin.com/in/fvendrell" },
    { label: "GitHub", text: "github.com/xesco", url: "https://github.com/xesco" },
    { label: "Location", text: "Barcelona, Spain" }
  ]
};
