# OfferZone Kubernetes Deployment

This directory contains the Kubernetes manifests to deploy the OfferZone microservices architecture.

## Prerequisites
- Kubernetes cluster (e.g., Minikube, Docker Desktop K8s, GKE).
- `kubectl` CLI tool installed and configured.
- Docker images built and available to the cluster (or use a registry).

## Deployment Steps

1.  **Apply Manifests**:
    Run the following command to apply all manifests in this directory:
    ```bash
    kubectl apply -f k8s/
    ```

2.  **Verify Deployment**:
    Check the status of the pods:
    ```bash
    kubectl get pods
    ```
    Wait until all pods are in `Running` state.

3.  **Access the Application**:
    The API Gateway is exposed via a `LoadBalancer` service on port `8085`.

    - **Docker Desktop / Cloud**: Access via `http://localhost:8085`.
    - **Minikube**: You may need to run `minikube tunnel` in a separate terminal to assign an external IP, or access via `minikube service api-gateway`.

## Components
- **Infrastructure**: MongoDB, Redis
- **Services**: ApiGateway, Products, User, Offers, Notifications, Favorites
- **Configuration**: ConfigMap (Env Vars), Secret (Sensitive Data)
