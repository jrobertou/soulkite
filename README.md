## Getting started
	
> ### Install needed libs
  	brew install imagemagick
    brew install graphicsmagick
> ### Install dependencies
    Open folder project
    npm install -d
> ### Set up fake domain on Mac
    Open /etc/hosts on Terminal
    127.0.0.1 	myshop.com
    127.0.0.1 	boutique.myshop.com
> ### Lauch server
  	PORT=3000 node server

## Lien d'accès au projet

Site de vente pour créer sa boutique : 
 
  	myshop.com:3000

Site exemple créé

* Partie admin
> http://boutique.myshop.com:3000/admin/login
> jeremy.robertou@gmail.com (passwd : jeremy)
* Site coté client
> http://boutique.myshop.com:3000

un client existe les mêmes login que le proprietaire de la boutique (jeremy)



## Etat du projet
### Admin
* Tableau de bord a faire
+ Gestion de groupe dans les produits a faire
- Parametre semble foncitonnel
- Coupon ?

### Magasin
+ #### General
> Seul les produits a la une sont visibles
>
> Affichage des categories non dispoble, a fiare tout ce qui tourne autour des produits sur le shop
+ #### Panier
> Bug sur les quantités quand une est supprimer c'est toujours pris en compte dans la commande final
- #### Checkout process
> Pas de redirection au checkout quand on créé le compte dans le process)
>
> Step 2 mauvais lien de validation cliquer changer l'url a la main /checkout/step/3
>
> Probleme sur l'ajout du frai de port passer a l'etape 4 via url
>
> Mauvaise redirection une pour confirmer la commande mais la commande marche bien en base
- #### Account
> Creation, login, logout, page recapitulative fonctionne correctement# soulkite
