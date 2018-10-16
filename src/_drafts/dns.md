### Domain Name System

Anybody familiar with the basics of the Internet knows that the addresses that we write on our browsers are just aliases for the actual location of the website we want to visit, i.e. mappings from domain names to IPs.

Before asking for the content of the website we want to visit, our browser first need to know where that content is located, that is, what’s the IP of the host. Who does the browser ask? How is that information available all around the world, regardless of who asks? How is that information created? Where is it registered? Who can register a domain?

#### Overview:
TL;DR

* Fully Qualified Domain Names (FQDN) are composed of the different domain name levels hierarchy, starting at the right-most side with the Top Level Domain (TLD)
* A nameserver is a server holding a “zone file” which contains the address of a host, or the address of another nameserver authoritative for a sub-domain.

Let’s take for example, www.example.com (that’s actually its official purpose). First thing we notice is that it is divided into different levels, separated by dots, namely “www”, “example” and “com”. For now, know that the hierarchy goes from right to left, so www is under example which is under com, one of the Top Level Domains (TLD).

According to VerySign, responsible for the .com and .net domain names, among others (more on this later), there are a total of 146,100,980 domain name under those two as for 10/24/2017. So, you might be now wondering: where is, then, that huge database? The answer is: nowhere. That database does not exists. There cannot be a single database in the world containing all the mappings from all those domains to their corresponding host’s IPs, it’s just non-viable. That’s why we have the Domain Name System, a decentralized domain name “database”.

“Decentralized” because each domain name level will take care of their own sub domains. This way, there is a database containing the mappings under “com”, another for the mappings under “net”, etc. On their turn, “example” might have a database containing the mappings for its subdomains. The servers containing those databases (or “zone files”) are the “nameservers” “authoritative” for those “zones”.

There is, somewhere in the world, a nameserver for the Top Level Domain (TLD) “.com”. This nameserver contains the addresses of the nameservers for all the domain names under “com”. The authoritative nameserver for “example” contains the mappings for its sub-domains, such as “www” and this authoritative nameserver contains, finally, the address for its host.

#### Resolution process
TL;DR:
* The client asks the local resolver for the IP of a FQDN

* The local resolver know the address of the root servers, and this know the address of the TLD nameservers
* The local resolver asks for the IP to the root server; it does not know it, but returns the address of the nameserver authoritative for “com”
* The local resolver asks for the IP to the “com” nameserver; it does not know it, but returns the address of the nameserver authoritative for “example”
* The local resolver asks for the IP to the “example” nameserver; it does not know it, but returns the address of the nameserver authoritative for “www”
* The local resolver asks for the IP to the “www” nameserver; it knows it, and returns the IP
* The local resolver returns the IP to the client

So how does all this actually work together? Let’s see:

<img src="/assets/images/posts/dns/post_dns_1.png">
Source: https://whois.icann.org/en/dns-and-whois-how-it-works

When your device (computer, smartphone, tablet, etc.) needs to know the IP corresponding to a FQDN it asks the local resolver. The local resolver it’s just a server your computer already knows, and its responsibility is to perform the actual look up and, usually, cache the result, for performance purposes. So it’s not your computer, but a local resolver who actually resolves an address to an IP.

The only thing that the resolver knows (because it’s statically configured into all resolvers) is the address of the “Root Zone”. This is a collection of 13 nameserver, maintained by the Internet Assigned Numbers Authority (IANA). The only purpose of these nameserver is to contain the addresses of the all the TLDs nameservers.

The resolver will then ask the root server for the IP of www.example.com (sticking with the same example). The root server is not authoritative for that domain, but knows the address of the “com” nameserver.

The resolver will then repeat this until some nameserver returns an IP: ask the “com” nameserver for the IP, the “com” nameserver is not authoritative, but knows the address of the “example” nameserver; ask the “example” nameserver, the “example” nameserver is not authoritative, but knows the address of the “www”; ask the “www” nameserver, BINGO! The “www” nameserver know the IP for the “www.example.com” host.

Once the local resolver receives the IP of the host, it will probably cache it, and then return it to the client, who can know send HTTP packages happily to the web server.

#### Domain registration
TL;DR:
* You (the “registrant”) want a domain
* You buy it from a domain name provider (the “registrar”)
* The registrar requests the registration to the TLD responsible (the “registry”)
* The registry updates its TLD zone file with the address of your domain’s nameserver

Now we know how the resolver asks for an IP and how the nameserver delegate to another authoritative nameserver or returns the host’s IP. But how does that information get there?

<img src="/assets/images/posts/dns/post_dns_2.png">
Source: https://whois.icann.org/en/domain-name-registration-process