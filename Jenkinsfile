pipeline {
    agent any

    environment {
        IMAGE_NAME = "moodboard/jwt-auth"
        DOCKER_TAG = "${BUILD_NUMBER}"
        TEST_PORT = "4000"
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning source code from GitHub...'
                git branch: 'main', 
                credentialsId: 'Github-Moodboard', 
                url: 'git@github.com:Moodboard-net/jwt-auth.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh "docker build -t ${IMAGE_NAME}:${DOCKER_TAG} ."
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing image to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    sh "docker push ${IMAGE_NAME}:${DOCKER_TAG}"
                }
            }
        }

        stage('Generate Compose File') {
            steps {
                echo 'Generating docker-compose file with current tag...'
                sh "sed 's/__BUILD_NUMBER__/${DOCKER_TAG}/g' docker-compose.yml > docker-compose.generated.yml"
            }
        }

        stage('Deploy to Target Server') {
            steps {
                echo 'Deploying to remote server...'
                sshPublisher(
                    publishers: [
                        sshPublisherDesc(
                            configName: 'docker',
                            transfers: [
                                sshTransfer(
                                    sourceFiles: 'docker-compose.generated.yml,dump.sql',
                                    remoteDirectory: 'jwt-auth',
                                    execCommand: '''
                                        cd /home/docker/jwt-auth
                                        docker-compose -f docker-compose.generated.yml down || true
                                        docker-compose -f docker-compose.generated.yml up -d
                                    '''
                                )
                            ],
                            failOnError: true,
                            verbose: true
                        )
                    ]
                )
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
        }
        failure {
            echo 'CI/CD pipeline failed.'
        }
    }
}
