VERSION=2.0.4

## crea red para producción


build-images:
	docker build ./packages/panel-vendure -f ./packages/panel-vendure/Dockerfile -t  chasqui-panel:$(VERSION)
	docker build ./packages/storefront -f ./packages/storefront/Dockerfile.nginx -t  chasqui-front:$(VERSION)

tag-for-github:
	docker tag chasqui-panel:$(VERSION) ghcr.io/incubepss/chasqui-panel:$(VERSION)
	docker tag chasqui-front:$(VERSION) ghcr.io/incubepss/chasqui-front:$(VERSION)

push-images:
	docker push ghcr.io/incubepss/chasqui-panel:$(VERSION)
	docker push ghcr.io/incubepss/chasqui-front:$(VERSION)	


storefront-build-image:
	docker build ./packages/storefront -f ./packages/storefront/Dockerfile.nginx -t  chasqui-front:$(VERSION)	

storefront-tag-for-github:
	docker tag chasqui-front:$(VERSION) ghcr.io/incubepss/chasqui-front:$(VERSION)

storefront-push-image:
	docker push ghcr.io/incubepss/chasqui-front:$(VERSION)		


panel-build-image:
	docker build ./packages/panel-vendure -f ./packages/panel-vendure/Dockerfile -t  chasqui-panel:$(VERSION)

panel-tag-for-github:
	docker tag chasqui-panel:$(VERSION) ghcr.io/incubepss/chasqui-panel:$(VERSION)

panel-push-image:
	docker push ghcr.io/incubepss/chasqui-panel:$(VERSION)